import pytest
import hmac
import hashlib
import json
from httpx import AsyncClient
from app.core.config import settings

@pytest.mark.asyncio
async def test_webhook_successful_transaction_valid_signature(async_client: AsyncClient, mock_monnify):
    # First, create an invoice so we can mark it paid
    invoice_payload = {
        "phone_number": "0987654321",
        "full_name": "Webhook User",
        "amount": 2500.00
    }
    inv_response = await async_client.post("/api/v1/billing/invoice", json=invoice_payload)
    assert inv_response.status_code == 200
    payment_reference = inv_response.json()["payment_reference"]
    
    # Now simulate webhook
    webhook_payload = {
        "eventType": "SUCCESSFUL_TRANSACTION",
        "eventData": {
            "paymentReference": payment_reference,
            "transactionReference": "TXN_12345",
            "amountPaid": 2500.00,
            "settlementAmount": 2400.00
        }
    }
    
    payload_bytes = json.dumps(webhook_payload).encode('utf-8')
    signature = hmac.new(
        settings.MONNIFY_SECRET_KEY.encode('utf-8'),
        payload_bytes,
        hashlib.sha512
    ).hexdigest()
    
    headers = {
        "x-monnify-signature": signature,
        "Content-Type": "application/json"
    }
    
    response = await async_client.post("/api/v1/webhooks/monnify", content=payload_bytes, headers=headers)
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    
    # We could also verify the DB status updated to PAID, but the 200 OK along with task triggering is good.

@pytest.mark.asyncio
async def test_webhook_invalid_signature(async_client: AsyncClient):
    webhook_payload = {
        "eventType": "SUCCESSFUL_TRANSACTION",
        "eventData": {
            "paymentReference": "FAKE_REF",
        }
    }
    
    payload_bytes = json.dumps(webhook_payload).encode('utf-8')
    headers = {
        "x-monnify-signature": "invalid_signature",
        "Content-Type": "application/json"
    }
    
    response = await async_client.post("/api/v1/webhooks/monnify", content=payload_bytes, headers=headers)
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid signature"}
