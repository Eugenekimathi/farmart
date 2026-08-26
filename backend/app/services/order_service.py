from app.extensions import db
from app.models.order import Order


ALLOWED_TRANSITIONS = {
    "PENDING": [
        "CONFIRMED",
        "REJECTED",
        "CANCELLED"
    ],
    "CONFIRMED": [
        "COMPLETED",
        "CANCELLED"
    ],
    "REJECTED": [],
    "CANCELLED": [],
    "COMPLETED": []
}


def get_order(order_id):
    order = db.session.get(Order, order_id)

    if not order:
        raise ValueError("Order not found")

    return order


def update_status(order_id, new_status):
    order = get_order(order_id)

    if new_status not in ALLOWED_TRANSITIONS.get(
        order.status,
        []
    ):
        raise ValueError(
            f"Cannot change order status "
            f"from {order.status} to {new_status}"
        )

    order.status = new_status

    db.session.commit()

    return order
