from datetime import datetime
from app.extensions import db


class Delivery(db.Model):
    __tablename__ = "deliveries"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    order_id = db.Column(
        db.Integer,
        db.ForeignKey("orders.id"),
        nullable=False,
        unique=True
    )

    delivery_address = db.Column(
        db.Text,
        nullable=False
    )

    delivery_phone = db.Column(
        db.String(20),
        nullable=False
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="PENDING"
    )

    tracking_reference = db.Column(
        db.String(100),
        unique=True,
        nullable=True
    )

    scheduled_date = db.Column(
        db.Date,
        nullable=True
    )

    delivered_at = db.Column(
        db.DateTime,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    order = db.relationship(
        "Order",
        backref=db.backref(
            "delivery",
            uselist=False
        )
    )