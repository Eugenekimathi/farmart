import pytest
from marshmallow import ValidationError

from app.schemas.order_item_schema import OrderItemSchema


def test_valid_order_item():
    schema = OrderItemSchema()

    data = {
        "order_id": 1,
        "animal_id": 1,
        "farmer_id": 1,
        "price": "100000.00",
        "quantity": 1
    }

    result = schema.load(data)

    assert result["order_id"] == 1
    assert result["animal_id"] == 1
    assert result["farmer_id"] == 1
    assert result["quantity"] == 1


def test_order_item_price_must_be_positive():
    schema = OrderItemSchema()

    data = {
        "order_id": 1,
        "animal_id": 1,
        "farmer_id": 1,
        "price": "0",
        "quantity": 1
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_order_item_quantity_must_be_at_least_one():
    schema = OrderItemSchema()

    data = {
        "order_id": 1,
        "animal_id": 1,
        "farmer_id": 1,
        "price": "100000.00",
        "quantity": 0
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_order_item_required_fields():
    schema = OrderItemSchema()

    with pytest.raises(ValidationError):
        schema.load({})