from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
import hmac
import hashlib
from typing import Optional, List
from sqlalchemy.orm import selectinload

from app.core.config import settings

from app.db.models import User, Invoice, InvoiceStatus, InvoiceItem, Staff, StaffRole
from app.api.dependencies import get_db_session, require_role
from app.services.monnify import monnify_client
from app.core.websockets import manager
from app.services.notifications import send_invoice_notification
import json

router = APIRouter()

class ItemRequest(BaseModel):
    description: str
    amount: float

class InvoiceRequest(BaseModel):
    phone_number: str
    full_name: str
    items: List[ItemRequest]

class ItemResponse(BaseModel):
    description: str
    amount: float

class InvoiceResponse(BaseModel):
    invoice_id: str
    payment_reference: str
    account_number: str
    bank_name: str
    account_name: str
    amount: float
    status: str
    signature: Optional[str] = None
    items: List[ItemResponse]

@router.post("/invoice", response_model=InvoiceResponse)
async def create_invoice(
    request: InvoiceRequest, 
    db: AsyncSession = Depends(get_db_session),
    current_staff: Staff = Depends(require_role([StaffRole.CASHIER]))
):
    # 1. Get or Create Patient
    result = await db.execute(select(User).where(User.phone_number == request.phone_number))
    user = result.scalars().first()
    
    if not user:
        user = User(phone_number=request.phone_number, full_name=request.full_name)
        db.add(user)
        await db.flush()
    # Calculate total amount
    total_amount = sum(item.amount for item in request.items)
        
    # 2. Create Invoice
    payment_ref = f"INV-{uuid.uuid4().hex[:10].upper()}"
    invoice = Invoice(
        patient_id=user.id,
        amount=total_amount,
        payment_reference=payment_ref,
        status=InvoiceStatus.PENDING
    )
    db.add(invoice)
    await db.flush()
    
    # 2.5 Add Items
    invoice_items = []
    for req_item in request.items:
        db_item = InvoiceItem(
            invoice_id=invoice.id,
            description=req_item.description,
            amount=req_item.amount
        )
        db.add(db_item)
        invoice_items.append(db_item)
    await db.flush()
    
    # 3. Call Monnify
    try:
        monnify_resp = await monnify_client.create_dynamic_virtual_account(
            payment_reference=payment_ref,
            amount=total_amount,
            customer_name=user.full_name,
            customer_email=f"{user.phone_number}@meditrust.local"  # Dummy email as placeholder
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=502, detail=f"Payment Gateway Error: {str(e)}")
        
    # 4. Save account number
    account_number = monnify_resp.get("accountNumber", "")
    bank_name = monnify_resp.get("bankName", "Unknown Bank")
    account_name = monnify_resp.get("accountName", "Meditrust")
    
    invoice.dynamic_account_number = account_number
    invoice.dynamic_bank_name = bank_name
    await db.commit()
    await db.refresh(invoice)
    
    # 5. Broadcast WebSockets Event
    await manager.broadcast(json.dumps({
        "type": "NEW_INVOICE",
        "invoice_id": str(invoice.id)
    }))
    
    # 6. Trigger SMS / WhatsApp Notification
    # Using background task for SMS delivery
    import asyncio
    asyncio.create_task(
        send_invoice_notification(
            to_phone=user.phone_number,
            patient_name=user.full_name,
            amount=float(invoice.amount),
            payment_reference=invoice.payment_reference
        )
    )
    
    # 6.5 Calculate Signature for Frontend Receipt
    secret = settings.MONNIFY_SECRET_KEY.encode('utf-8')
    message = str(invoice.id).encode('utf-8')
    signature = hmac.new(secret, message, hashlib.sha512).hexdigest()

    return InvoiceResponse(
        invoice_id=str(invoice.id),
        payment_reference=invoice.payment_reference,
        account_number=account_number,
        bank_name=bank_name,
        account_name=account_name,
        amount=float(invoice.amount),
        status=invoice.status.value,
        signature=signature,
        items=[ItemResponse(description=i.description, amount=float(i.amount)) for i in invoice_items]
    )

from datetime import datetime, timedelta

class InvoiceListResponse(BaseModel):
    invoice_id: str
    patient_name: str
    amount: float
    status: str
    created_at: str

@router.get("/invoices", response_model=List[InvoiceListResponse])
async def get_all_invoices(
    history: bool = False,
    db: AsyncSession = Depends(get_db_session),
    current_staff: Staff = Depends(require_role([StaffRole.CASHIER, StaffRole.PHARMACY]))
):
    query = select(Invoice).options(selectinload(Invoice.patient))
    
    if not history:
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        query = query.where(Invoice.created_at >= twenty_four_hours_ago)
        
    query = query.order_by(Invoice.created_at.desc()).limit(100 if history else 50)
    
    result = await db.execute(query)
    invoices = result.scalars().all()
    
    return [
        InvoiceListResponse(
            invoice_id=str(inv.id),
            patient_name=inv.patient.full_name,
            amount=float(inv.amount),
            status=inv.status.value,
            created_at=inv.created_at.isoformat()
        )
        for inv in invoices
    ]

class InvoiceStatusResponse(BaseModel):
    status: str

@router.get("/invoice/{invoice_id}", response_model=InvoiceStatusResponse)
async def get_invoice_status(
    invoice_id: str, 
    db: AsyncSession = Depends(get_db_session),
    current_staff: Staff = Depends(require_role([StaffRole.CASHIER]))
):
    try:
        uuid_obj = uuid.UUID(invoice_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Invoice ID format")

    result = await db.execute(select(Invoice).where(Invoice.id == uuid_obj))
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    return InvoiceStatusResponse(status=invoice.status.value)



class VerifyResponse(BaseModel):
    is_valid: bool
    status: Optional[str] = None
    patient_name: Optional[str] = None
    amount: Optional[float] = None
    paid_at: Optional[str] = None

@router.get("/verify", response_model=VerifyResponse)
async def verify_receipt(
    invoice_id: str, 
    sig: str, 
    db: AsyncSession = Depends(get_db_session),
    current_staff: Staff = Depends(require_role([StaffRole.SECURITY]))
):
    # Verify HMAC signature
    secret = settings.MONNIFY_SECRET_KEY.encode('utf-8')
    message = str(invoice_id).encode('utf-8')
    expected_sig = hmac.new(secret, message, hashlib.sha512).hexdigest()
    
    if not hmac.compare_digest(expected_sig, sig):
        return VerifyResponse(is_valid=False)
        
    try:
        uuid_obj = uuid.UUID(invoice_id)
    except ValueError:
        return VerifyResponse(is_valid=False)

    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Invoice)
        .options(selectinload(Invoice.patient), selectinload(Invoice.payment))
        .where(Invoice.id == uuid_obj)
    )
    invoice = result.scalars().first()
    
    if not invoice:
        return VerifyResponse(is_valid=False)
        
    paid_at_str = None
    if invoice.payment:
        paid_at_str = invoice.payment.paid_at.isoformat()
        
    return VerifyResponse(
        is_valid=True,
        status=invoice.status.value,
        patient_name=invoice.patient.full_name,
        amount=float(invoice.amount),
        paid_at=paid_at_str
    )
