import pytest
from sqlalchemy.exc import IntegrityError


def test_cart_can_be_created(session, cart):
    assert cart.id is not None
    assert cart.user_id is not None


def test_user_can_have_only_one_cart(session, user):
    from app.models.cart import Cart

    cart1 = Cart(user_id=user.id)

    session.add(cart1)
    session.commit()

    cart2 = Cart(user_id=user.id)

    session.add(cart2)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()