import pytest
from sqlalchemy.exc import IntegrityError


def test_cart_item_can_be_created(session, cart_item):
    assert cart_item.id is not None
    assert cart_item.cart_id is not None
    assert cart_item.animal_id is not None


def test_same_animal_cannot_be_added_twice_to_cart(
    session,
    cart,
    animal
):
    from app.models.cart_item import CartItem

    item1 = CartItem(
        cart_id=cart.id,
        animal_id=animal.id
    )

    session.add(item1)
    session.commit()

    item2 = CartItem(
        cart_id=cart.id,
        animal_id=animal.id
    )

    session.add(item2)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()