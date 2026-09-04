import pytest
from sqlalchemy.exc import IntegrityError


def test_order_can_be_created(session, order):
    assert order.id is not None
    assert order.buyer_id is not None
    assert order.total_amount == 100000
    assert order.status == "PENDING"
    assert order.delivery_address == "Nairobi"


def test_order_requires_buyer(session):
    from app.models.order import Order

    order = Order(
        total_amount=100000,
        status="PENDING",
        delivery_address="Nairobi",
        delivery_phone="0712345678"
    )

    session.add(order)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()