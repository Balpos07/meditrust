import base64
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

class MonnifyClient:
    def __init__(self):
        self.base_url = settings.MONNIFY_BASE_URL
        self.api_key = settings.MONNIFY_API_KEY
        self.secret_key = settings.MONNIFY_SECRET_KEY
        self.contract_code = settings.MONNIFY_CONTRACT_CODE
        self._token: Optional[str] = None

    async def _get_auth_headers(self) -> Dict[str, str]:
        if not self._token:
            await self.authenticate()
        return {
            "Authorization": f"Bearer {self._token}",
            "Content-Type": "application/json"
        }

    async def authenticate(self) -> str:
        if self.api_key == "dev_api_key":
            self._token = "mock_dev_token"
            return self._token
            
        auth_string = f"{self.api_key}:{self.secret_key}"
        encoded_auth = base64.b64encode(auth_string.encode()).decode()
        headers = {
            "Authorization": f"Basic {encoded_auth}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/auth/login",
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            if data.get("requestSuccessful"):
                self._token = data["responseBody"]["accessToken"]
                return self._token
            else:
                raise Exception(f"Monnify authentication failed: {data}")

    async def create_dynamic_virtual_account(
        self, 
        payment_reference: str, 
        amount: float, 
        customer_name: str, 
        customer_email: str
    ) -> Dict[str, Any]:
        if self.api_key == "dev_api_key":
            return {
                "accountNumber": "0987654321",
                "bankName": "MediTrust Mock Bank",
                "accountName": customer_name
            }
            
        headers = await self._get_auth_headers()
        
        init_payload = {
            "amount": amount,
            "customerName": customer_name,
            "customerEmail": customer_email,
            "paymentReference": payment_reference,
            "paymentDescription": f"Invoice {payment_reference}",
            "currencyCode": "NGN",
            "contractCode": self.contract_code,
            "paymentMethods": ["ACCOUNT_TRANSFER"]
        }
        
        async with httpx.AsyncClient() as client:
            # 1. Initialize Transaction
            init_resp = await client.post(
                f"{self.base_url}/api/v1/merchant/transactions/init-transaction",
                headers=headers,
                json=init_payload
            )
            if init_resp.status_code != 200:
                raise Exception(f"Failed to initialize transaction. Status: {init_resp.status_code}, Response: {init_resp.text}")
            init_resp.raise_for_status()
            init_data = init_resp.json()
            
            if not init_data.get("requestSuccessful"):
                raise Exception(f"Failed to initialize transaction: {init_data}")
                
            transaction_reference = init_data["responseBody"]["transactionReference"]
            
            # 2. Init Bank Transfer Payment (Dynamic Virtual Account)
            bank_payload = {
                "transactionReference": transaction_reference
            }
            
            bank_resp = await client.post(
                f"{self.base_url}/api/v1/merchant/bank-transfer/init-payment",
                headers=headers,
                json=bank_payload
            )
            bank_resp.raise_for_status()
            bank_data = bank_resp.json()
            
            if bank_data.get("requestSuccessful"):
                return bank_data["responseBody"]
            else:
                raise Exception(f"Monnify virtual account creation failed: {bank_data}")

monnify_client = MonnifyClient()
