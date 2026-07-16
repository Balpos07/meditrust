import hmac
import hashlib
import qrcode
from io import BytesIO
import logging
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from app.tasks.celery_app import celery_app
from app.core.config import settings

logger = logging.getLogger(__name__)

def generate_hmac_signature(invoice_id: str) -> str:
    secret = settings.MONNIFY_SECRET_KEY.encode('utf-8')
    message = str(invoice_id).encode('utf-8')
    signature = hmac.new(secret, message, hashlib.sha512).hexdigest()
    return signature

@celery_app.task(name="generate_receipt_and_notify_patient")
def generate_receipt_and_notify_patient(invoice_id: str, amount: float, phone_number: str, patient_name: str, payment_ref: str):
    logger.info(f"Starting receipt generation for invoice {invoice_id}")
    
    # 1. Generate Verification URL
    signature = generate_hmac_signature(invoice_id)
    verification_url = f"{settings.VERIFICATION_URL_BASE}/{invoice_id}?sig={signature}"
    
    # 2. Generate QR Code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(verification_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    qr_buffer = BytesIO()
    qr_img.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)
    
    # 3. Generate PDF Receipt
    pdf_buffer = BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=letter)
    width, height = letter
    
    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, height - 50, "Meditrust Instant Receipt")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 100, f"Invoice ID: {invoice_id}")
    c.drawString(50, height - 120, f"Patient Name: {patient_name}")
    c.drawString(50, height - 140, f"Amount Paid: NGN {amount}")
    c.drawString(50, height - 160, f"Payment Ref: {payment_ref}")
    
    c.drawString(50, height - 200, "Scan to Verify:")
    
    # Draw QR Code
    qr_reader = ImageReader(qr_buffer)
    c.drawImage(qr_reader, 50, height - 350, width=120, height=120)
    
    c.save()
    pdf_bytes = pdf_buffer.getvalue()
    
    # 4. Mock SMS / WhatsApp notification (Twilio pattern)
    logger.info(f"Mock Twilio Client: Sending WhatsApp receipt to {phone_number} with {len(pdf_bytes)} bytes PDF attached.")
    logger.info(f"Mock Twilio Client: Message content: 'Your Meditrust receipt is ready. Verify at {verification_url}'")
    
    return True
