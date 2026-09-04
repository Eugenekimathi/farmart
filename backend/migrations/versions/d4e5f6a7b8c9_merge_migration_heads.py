"""merge migration heads

Revision ID: d4e5f6a7b8c9
Revises: 68f93ba3a9bc, c3d4e5f6a7b8
Create Date: 2026-09-04

This is an Alembic merge-only revision. It performs no schema or data
operation; it records that the independently created migration branches have
both been applied before subsequent migrations run.
"""


revision = "d4e5f6a7b8c9"
down_revision = ("68f93ba3a9bc", "c3d4e5f6a7b8")
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
