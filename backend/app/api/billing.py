from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
import hmac
import hashlib
from typing import Optional

from app.core.config import settings

from app.db.models import User, Invoice, InvoiceStatus
from app.api.dependencies import get_db_session
from app.services.monnify import monnify_client

router = APIRouter()

class InvoiceRequest(BaseModel):
    phone_number: str
    full_name: str
    amount: float

class InvoiceResponse(BaseModel):
    invoice_id: str
    payment_reference: str
    account_number: str
    bank_name: str
    account_name: str
    amount: float
    status: str

@router.post("/invoice", response_model=InvoiceResponse)
async def create_invoice(request: InvoiceRequest, db: AsyncSession = Depends(get_db_session)):
    # 1. Get or Create Patient
    result = await db.execute(select(User).where(User.phone_number == request.phone_number))
    user = result.scalars().first()
    
    if not user:
        user = User(phone_number=request.phone_number, full_name=request.full_name)
        db.add(user)
        await db.flush()
        
    # 2. Create Invoice
    payment_ref = f"INV-{uuid.uuid4().hex[:10].upper()}"
    invoice = Invoice(
        patient_id=user.id,
        amount=request.amount,
        payment_reference=payment_ref,
        status=InvoiceStatus.PENDING
    )
    db.add(invoice)
    await db.flush()
    
    # 3. Call Monnify
    try:
        monnify_resp = await monnify_client.create_dynamic_virtual_account(
            payment_reference=payment_ref,
            amount=request.amount,
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
    
    return InvoiceResponse(
        invoice_id=str(invoice.id),
        payment_reference=invoice.payment_reference,
        account_number=account_number,
        bank_name=bank_name,
        account_name=account_name,
        amount=float(invoice.amount),
        status=invoice.status.value
    )

class InvoiceStatusResponse(BaseModel):
    status: str

@router.get("/invoice/{invoice_id}", response_model=InvoiceStatusResponse)
async def get_invoice_status(invoice_id: str, db: AsyncSession = Depends(get_db_session)):
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
async def verify_receipt(invoice_id: str, sig: str, db: AsyncSession = Depends(get_db_session)):
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
