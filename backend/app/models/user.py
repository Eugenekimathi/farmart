from app.extensions import db
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    full_name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    phone = db.Column(
        db.String(20),
        unique=True,
        nullable=False
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False
    )

    role = db.Column(
        db.String(20),
        nullable=False
    )

    location = db.Column(
        db.String(150),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    # Relationships
    farmer = db.relationship(
        "Farmer",
        back_populates="user",
        uselist=False
    )

    cart = db.relationship(
        "Cart",
        back_populates="user",
        uselist=False
    )