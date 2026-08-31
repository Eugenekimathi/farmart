from app.extensions import db
from app.models.delivery import Delivery
from datetime import datetime


ALLOWED_TRANSITIONS = {
    status: ["PENDING", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]
    for status in ["PENDING", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]
}


def get_delivery(delivery_id):

    delivery = db.session.get(
        Delivery,
        delivery_id
    )

    if not delivery:
        raise ValueError(
            "Delivery not found"
        )

    return delivery


def update_status(
    delivery_id,
    new_status
):

    delivery = get_delivery(delivery_id)

    if new_status not in ALLOWED_TRANSITIONS.get(
        delivery.status,
        []
    ):
        raise ValueError(
            f"Cannot change delivery status "
            f"from {delivery.status} to {new_status}"
        )

    delivery.status = new_status
    if new_status == "DELIVERED":
        delivery.delivered_at = datetime.utcnow()

    db.session.commit()

    return delivery
