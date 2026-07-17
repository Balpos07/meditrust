from fastapi import APIRouter, Depends, Request, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import hmac
import hashlib
import json
import logging

from app.db.models import Invoice, InvoiceStatus, Payment
from app.api.dependencies import get_db_session
from app.core.config import settings
from app.tasks.receipts import generate_receipt_and_notify_patient
from app.core.websockets import manager

router = APIRouter()
logger = logging.getLogger(__name__)

def verify_monnify_signature(payload_bytes: bytes, signature: str) -> bool:
    if not signature:
        return False
    expected_sig = hmac.new(
        settings.MONNIFY_SECRET_KEY.encode('utf-8'),
        payload_bytes,
        hashlib.sha512
    ).hexdigest()
    return hmac.compare_digest(expected_sig, signature)

@router.post("/monnify")
async def monnify_webhook(
    request: Request,
    x_monnify_signature: str = Header(None),
    db: AsyncSession = Depends(get_db_session)
):
    payload_bytes = await request.body()
    
    if not verify_monnify_signature(payload_bytes, x_monnify_signature):
        logger.warning("Invalid Monnify signature")
        raise HTTPException(status_code=401, detail="Invalid signature")
        
    try:
        payload = json.loads(payload_bytes)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = payload.get("eventType")
    event_data = payload.get("eventData", {})
    
    if event_type == "SUCCESSFUL_TRANSACTION":
        payment_reference = event_data.get("paymentReference")
        transaction_reference = event_data.get("transactionReference")
        amount_paid = event_data.get("amountPaid")
        settled_amount = event_data.get("settlementAmount")
        
        # Find invoice
        result = await db.execute(
            select(Invoice).options(selectinload(Invoice.patient)).where(Invoice.payment_reference == payment_reference)
        )
        invoice = result.scalars().first()
        
        if invoice and invoice.status != InvoiceStatus.PAID:
            invoice.status = InvoiceStatus.PAID
            
            # Create payment record
            payment = Payment(
                invoice_id=invoice.id,
                transaction_reference=transaction_reference,
                amount_paid=amount_paid,
                settled_amount=settled_amount
            )
            db.add(payment)
            await db.commit()
            
            # Spawn Celery Task
            generate_receipt_and_notify_patient.delay(
                invoice_id=str(invoice.id),
                amount=float(amount_paid),
                phone_number=invoice.patient.phone_number,
                patient_name=invoice.patient.full_name,
                payment_ref=payment_reference
            )
            
            # Broadcast over WebSockets
            await manager.broadcast(json.dumps({
                "type": "INVOICE_PAID",
                "invoice_id": str(invoice.id)
            }))
            
    # Always return 200 OK instantly for webhooks
    return {"status": "ok"}

from pydantic import BaseModel
class SimulatePayload(BaseModel):
    payment_reference: str
    amount: float

@router.post("/monnify/simulate")
async def simulate_webhook(
    payload: SimulatePayload,
    db: AsyncSession = Depends(get_db_session)
):
    """DEV ONLY: Allows frontend to simulate a webhook without needing signatures"""
    result = await db.execute(
        select(Invoice).options(selectinload(Invoice.patient)).where(Invoice.payment_reference == payload.payment_reference)
    )
    invoice = result.scalars().first()
    
    if invoice and invoice.status != InvoiceStatus.PAID:
        invoice.status = InvoiceStatus.PAID
        
        payment = Payment(
            invoice_id=invoice.id,
            transaction_reference="DEV_SIM_" + payload.payment_reference,
            amount_paid=payload.amount,
            settled_amount=payload.amount
        )
        db.add(payment)
        await db.commit()
        
        generate_receipt_and_notify_patient.delay(
            invoice_id=str(invoice.id),
            amount=float(payload.amount),
            phone_number=invoice.patient.phone_number,
            patient_name=invoice.patient.full_name,
            payment_ref=payload.payment_reference
        )
        
        # Broadcast over WebSockets
        await manager.broadcast(json.dumps({
            "type": "INVOICE_PAID",
            "invoice_id": str(invoice.id)
        }))
        
    return {"status": "simulated"}
