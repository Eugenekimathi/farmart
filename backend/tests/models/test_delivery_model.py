import pytest
from sqlalchemy.exc import IntegrityError


def test_delivery_can_be_created(session, delivery):
    assert delivery.id is not None
    assert delivery.order_id is not None
    assert delivery.delivery_address == "Nairobi"
    assert delivery.delivery_phone == "0712345678"
    assert delivery.status == "PENDING"


def test_order_can_have_only_one_delivery(session, order):
    from app.models.delivery import Delivery

    delivery1 = Delivery(
        order_id=order.id,
        delivery_address="Nairobi",
        delivery_phone="0712345678",
        status="PENDING",
        tracking_reference="TRACK-001"
    )

    session.add(delivery1)
    session.commit()

    delivery2 = Delivery(
        order_id=order.id,
        delivery_address="Nakuru",
        delivery_phone="0722222222",
        status="PENDING",
        tracking_reference="TRACK-002"
    )

    session.add(delivery2)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()


def test_tracking_reference_must_be_unique(session, order):
    from app.models.delivery import Delivery
    from app.models.order import Order

    delivery1 = Delivery(
        order_id=order.id,
        delivery_address="Nairobi",
        delivery_phone="0712345678",
        tracking_reference="TRACK-SAME"
    )

    session.add(delivery1)
    session.commit()

    order2 = Order(
        buyer_id=order.buyer_id,
        total_amount=50000,
        status="PENDING",
        delivery_address="Nairobi",
        delivery_phone="0722222222"
    )

    session.add(order2)
    session.commit()

    delivery2 = Delivery(
        order_id=order2.id,
        delivery_address="Nakuru",
        delivery_phone="0722222222",
        tracking_reference="TRACK-SAME"
    )

    session.add(delivery2)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()