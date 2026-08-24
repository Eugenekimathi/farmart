import pytest
from marshmallow import ValidationError

from app.schemas.cart_schema import CartSchema


def test_valid_cart():
    schema = CartSchema()

    data = {
        "user_id": 1
    }

    result = schema.load(data)

    assert result["user_id"] == 1


def test_cart_user_id_is_required():
    schema = CartSchema()

    with pytest.raises(ValidationError):
        schema.load({})