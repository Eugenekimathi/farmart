from app.extensions import db
from datetime import datetime

class Cart(db.Model):
    __tablename__ = "carts"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationships
    user = db.relationship(
        "User",
        back_populates="cart"
    )

    cart_items = db.relationship(
        "CartItem",
        back_populates="cart",
        cascade="all, delete-orphan"
    )