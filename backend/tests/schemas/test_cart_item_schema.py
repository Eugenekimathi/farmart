import pytest
from marshmallow import ValidationError

from app.schemas.cart_item_schema import CartItemSchema


def test_valid_cart_item():
    schema = CartItemSchema()

    data = {
        "cart_id": 1,
        "animal_id": 1
    }

    result = schema.load(data)

    assert result["cart_id"] == 1
    assert result["animal_id"] == 1


def test_cart_item_cart_id_is_required():
    schema = CartItemSchema()

    data = {
        "animal_id": 1
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_cart_item_animal_id_is_required():
    schema = CartItemSchema()

    data = {
        "cart_id": 1
    }

    with pytest.raises(ValidationError):
        schema.load(data)