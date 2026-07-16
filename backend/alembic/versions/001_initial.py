"""initial

Revision ID: 001
Revises: 
Create Date: 2026-07-15 22:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Users table
    op.create_table('users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('phone_number', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_phone_number'), 'users', ['phone_number'], unique=False)
    
    # Invoices table
    op.create_table('invoices',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('patient_id', sa.UUID(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'PAID', 'EXPIRED', name='invoicestatus'), nullable=False),
        sa.Column('payment_reference', sa.String(), nullable=False),
        sa.Column('dynamic_account_number', sa.String(), nullable=True),
        sa.Column('dynamic_bank_name', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_invoices_payment_reference'), 'invoices', ['payment_reference'], unique=True)
    
    # Payments table
    op.create_table('payments',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('invoice_id', sa.UUID(), nullable=False),
        sa.Column('transaction_reference', sa.String(), nullable=False),
        sa.Column('amount_paid', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('settled_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('paid_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['invoice_id'], ['invoices.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('transaction_reference')
    )

def downgrade() -> None:
    op.drop_table('payments')
    op.drop_index(op.f('ix_invoices_payment_reference'), table_name='invoices')
    op.drop_table('invoices')
    op.drop_index(op.f('ix_users_phone_number'), table_name='users')
    op.drop_table('users')
