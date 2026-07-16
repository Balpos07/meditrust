import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Enum, ForeignKey, DateTime, Uuid
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class InvoiceStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    EXPIRED = "EXPIRED"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    
    invoices = relationship("Invoice", back_populates="patient", cascade="all, delete")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.PENDING, nullable=False)
    payment_reference = Column(String, unique=True, index=True, nullable=False)
    dynamic_account_number = Column(String, nullable=True)
    dynamic_bank_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    
    patient = relationship("User", back_populates="invoices")
    payment = relationship("Payment", back_populates="invoice", uselist=False, cascade="all, delete")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id = Column(Uuid(as_uuid=True), ForeignKey("invoices.id"), nullable=False)
    transaction_reference = Column(String, unique=True, nullable=False)
    amount_paid = Column(Numeric(10, 2), nullable=False)
    settled_amount = Column(Numeric(10, 2), nullable=False)
    paid_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    
    invoice = relationship("Invoice", back_populates="payment")
