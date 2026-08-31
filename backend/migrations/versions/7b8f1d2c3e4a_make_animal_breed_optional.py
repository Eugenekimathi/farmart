"Allow animals without a known breed.

Revision ID: 7b8f1d2c3e4a
Revises: 414b2690c06e
""
from alembic import op
import sqlalchemy as sa
revision = "7b8f1d2c3e4a"
down_revision = "414b2690c06e"
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table("animals") as batch_op:
        batch_op.alter_column(
            "breed_id",
            existing_type=sa.Integer(),
            nullable=True,
        )


def downgrade():
    with op.batch_alter_table("animals") as batch_op:
        batch_op.alter_column(
            "breed_id",
            existing_type=sa.Integer(),
            nullable=False,
        )
