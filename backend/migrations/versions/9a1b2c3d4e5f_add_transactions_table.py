"""add transactions table

Revision ID: 9a1b2c3d4e5f
Revises: 7b8f1d2c3e4a
Create Date: 2026-09-02 21:27:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9a1b2c3d4e5f'
down_revision = '7b8f1d2c3e4a'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('checkout_request_id', sa.String(length=100), nullable=False),
        sa.Column('merchant_request_id', sa.String(length=100), nullable=True),
        sa.Column('phone_number', sa.String(length=20), nullable=False),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False),
        sa.Column('result_code', sa.String(length=20), nullable=True),
        sa.Column('result_description', sa.String(length=255), nullable=True),
        sa.Column('receipt_number', sa.String(length=50), nullable=True),
        sa.Column('transaction_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('checkout_request_id')
    )
    op.create_index(
        op.f('ix_transactions_checkout_request_id'),
        'transactions',
        ['checkout_request_id'],
        unique=True,
    )


def downgrade():
    op.drop_index(
        op.f('ix_transactions_checkout_request_id'),
        table_name='transactions',
    )
    op.drop_table('transactions')