import pytest
from sqlalchemy.exc import IntegrityError


def test_order_item_can_be_created(session, order_item):
    assert order_item.id is not None
    assert order_item.order_id is not None
    assert order_item.animal_id is not None
    assert order_item.farmer_id is not None
    assert order_item.price == 100000
    assert order_item.quantity == 1


def test_order_item_requires_order(session, animal, farmer):
    from app.models.order_item import OrderItem

    item = OrderItem(
        animal_id=animal.id,
        farmer_id=farmer.id,
        price=100000,
        quantity=1
    )

    session.add(item)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()