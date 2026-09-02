from datetime import datetime
from app.extensions import db


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)

    order_id = db.Column(
        db.Integer,
        db.ForeignKey("orders.id"),
        nullable=False
    )

    # Daraja transaction identifiers
    checkout_request_id = db.Column(
        db.String(100),
        unique=True,
        nullable=False,
        index=True
    )

    merchant_request_id = db.Column(
        db.String(100),
        nullable=True
    )

    # Payment metadata
    phone_number = db.Column(
        db.String(20),
        nullable=False
    )

    amount = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    # Status and result
    status = db.Column(
        db.String(30),
        nullable=False,
        default="PENDING"
    )

    result_code = db.Column(
        db.String(20),
        nullable=True
    )

    result_description = db.Column(
        db.String(255),
        nullable=True
    )

    receipt_number = db.Column(
        db.String(50),
        nullable=True
    )

    transaction_date = db.Column(
        db.DateTime,
        nullable=True
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
    order = db.relationship(
        "Order",
        backref=db.backref(
            "transactions",
            lazy=True
        )
    )

    def __repr__(self):
        return (
            f"<Transaction id={self.id} "
            f"checkout_request_id={self.checkout_request_id} "
            f"status={self.status}>"
        )