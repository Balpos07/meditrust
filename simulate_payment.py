import json
import hmac
import hashlib
import urllib.request
import sys

def simulate_monnify_webhook(payment_reference: str, amount: float):
    url = "http://localhost:8000/api/v1/webhooks/monnify"
    # Using the same test key you have in your environment
    secret_key = "V43WVW44FFJJ5HAFKV9R24NARZGJYNPN" 
    
    payload = {
        "eventType": "SUCCESSFUL_TRANSACTION",
        "eventData": {
            "paymentReference": payment_reference,
            "transactionReference": "MNFY_TEST_" + payment_reference,
            "amountPaid": amount,
            "settlementAmount": amount
        }
    }
    
    payload_bytes = json.dumps(payload).encode('utf-8')
    
    # Calculate HMAC SHA512 signature
    signature = hmac.new(
        secret_key.encode('utf-8'),
        payload_bytes,
        hashlib.sha512
    ).hexdigest()
    
    req = urllib.request.Request(
        url,
        data=payload_bytes,
        headers={
            "Content-Type": "application/json",
            "x-monnify-signature": signature
        },
        method="POST"
    )
    
    try:
        response = urllib.request.urlopen(req)
        print(f"Success! Status Code: {response.getcode()}")
        print(response.read().decode())
    except Exception as e:
        print("Failed to send webhook:", e)
        if hasattr(e, 'read'):
            print(e.read().decode())

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python simulate_payment.py <payment_reference> <amount>")
        sys.exit(1)
        
    payment_ref = sys.argv[1]
    amount = float(sys.argv[2])
    simulate_monnify_webhook(payment_ref, amount)
