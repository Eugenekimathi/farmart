"""add poultry breeds to the catalog

Revision ID: c3d4e5f6a7b8
Revises: 9a1b2c3d4e5f
"""
from alembic import op
import sqlalchemy as sa


revision = "c3d4e5f6a7b8"
down_revision = "9a1b2c3d4e5f"
branch_labels = None
depends_on = None


POULTRY_BREEDS = (
    ("Improved Kienyeji", "Improved indigenous dual-purpose chicken"),
    ("Kuroiler", "Hardy dual-purpose meat and egg chicken"),
    ("Kenbro", "Fast-growing dual-purpose chicken"),
    ("Rainbow Rooster", "Dual-purpose free-range chicken"),
    ("Rhode Island Red", "Reliable brown-egg laying chicken"),
)


def upgrade():
    bind = op.get_bind()
    statement = sa.text(
        """
        INSERT INTO breeds (name, description, animal_type_id)
        SELECT :name, :description, animal_types.id
        FROM animal_types
        WHERE animal_types.name = 'Chicken'
          AND NOT EXISTS (
              SELECT 1 FROM breeds
              WHERE breeds.name = :name
                AND breeds.animal_type_id = animal_types.id
          )
        """
    )
    for name, description in POULTRY_BREEDS:
        bind.execute(statement, {"name": name, "description": description})


def downgrade():
    # Catalog entries may be referenced by animals after upgrade; deleting them
    # during a downgrade would risk data loss, so this revision is intentionally
    # non-destructive.
    pass
