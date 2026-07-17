import asyncio
from twilio.rest import Client
from app.core.config import settings

def send_notification_sync(to_phone: str, message: str, is_whatsapp: bool = False):
    """
    Sends an SMS or WhatsApp message using Twilio.
    Executed synchronously, so it should be run in an executor.
    """
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN or not settings.TWILIO_PHONE_NUMBER:
        print(f"[Notifications Mock] Missing Twilio config. Would have sent:")
        print(f"  To: {to_phone} (WhatsApp: {is_whatsapp})")
        print(f"  Body: {message}")
        return

    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        # Format the numbers for Twilio
        # Standardize Nigerian numbers from 080... to +23480...
        to_number = to_phone.strip()
        if to_number.startswith('0'):
            to_number = "+234" + to_number[1:]
        elif not to_number.startswith('+'):
            to_number = "+" + to_number
            
        from_number = settings.TWILIO_PHONE_NUMBER

        if is_whatsapp:
            to_number = f"whatsapp:{to_number}"
            from_number = f"whatsapp:{from_number}"

        message_obj = client.messages.create(
            body=message,
            from_=from_number,
            to=to_number
        )
        print(f"[Notifications] Sent message SID: {message_obj.sid}")
    except Exception as e:
        print(f"[Notifications Error] Failed to send message: {e}")

async def send_invoice_notification(to_phone: str, patient_name: str, amount: float, payment_reference: str):
    """
    Asynchronously fires the notification.
    """
    url = f"{settings.FRONTEND_URL}/pay/{payment_reference}"
    
    # Send SMS
    sms_message = f"Hello {patient_name}, your MediTrust bill for NGN {amount:,.2f} is ready. View details and pay here: {url}"
    
    # Run in background executor to not block FastAPI
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, send_notification_sync, to_phone, sms_message, False)
    
    # We could also send WhatsApp:
    # await loop.run_in_executor(None, send_notification_sync, to_phone, sms_message, True)
