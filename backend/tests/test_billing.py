import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_invoice(async_client: AsyncClient, mock_monnify):
    payload = {
        "phone_number": "1234567890",
        "full_name": "Test Patient",
        "amount": 5000.00
    }
    
    response = await async_client.post("/api/v1/billing/invoice", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["account_number"] == "1234567890"
    assert data["bank_name"] == "Test Bank"
    assert data["account_name"] == "Test Meditrust"
    assert data["amount"] == 5000.0
    assert data["status"] == "PENDING"
    assert "invoice_id" in data
    assert "payment_reference" in data
