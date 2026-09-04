from app.extensions import db
from app.models.payment import Payment
from app.models.order import Order


ALLOWED_STATUSES = [
    "PENDING",
    "SUCCESS",
    "FAILED",
    "CANCELLED"
]


def create_payment(
    order_id,
    amount,
    payment_method,
    transaction_reference=None,
    status="PENDING"
):

    order = db.session.get(Order, order_id)

    if not order:
        raise ValueError("Order not found")

    if float(amount) != float(order.total_amount):
        raise ValueError(
            "Payment amount does not match order total"
        )

    existing = Payment.query.filter_by(
        order_id=order_id
    ).first()

    if existing:
        raise ValueError(
            "Payment already exists for this order"
        )

    payment = Payment(
        order_id=order_id,
        amount=amount,
        payment_method=payment_method,
        transaction_reference=transaction_reference,
        status=status
    )

    db.session.add(payment)
    db.session.commit()

    return payment


def update_payment_status(payment_id, new_status):

    if new_status not in ALLOWED_STATUSES:
        raise ValueError(
            "Invalid payment status"
        )

    payment = db.session.get(
        Payment,
        payment_id
    )

    if not payment:
        raise ValueError("Payment not found")

    payment.status = new_status

    db.session.commit()

    return payment
