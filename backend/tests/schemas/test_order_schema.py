import pytest
from marshmallow import ValidationError
from decimal import Decimal

from app.schemas.order_schema import OrderSchema


def test_valid_order():
    schema = OrderSchema()

    data = {
        "buyer_id": 1,
        "total_amount": "150000.00",
        "delivery_address": "Nairobi, Kenya",
        "delivery_phone": "0712345678"
    }

    result = schema.load(data)

    assert result["buyer_id"] == 1
    assert result["total_amount"] == Decimal("150000.00")
    assert result["status"] == "PENDING"


def test_order_status_defaults_to_pending():
    schema = OrderSchema()

    data = {
        "buyer_id": 1,
        "total_amount": "150000.00",
        "delivery_address": "Nairobi, Kenya",
        "delivery_phone": "0712345678"
    }

    result = schema.load(data)

    assert result["status"] == "PENDING"


def test_negative_order_amount_is_rejected():
    schema = OrderSchema()

    data = {
        "buyer_id": 1,
        "total_amount": "0",
        "delivery_address": "Nairobi, Kenya",
        "delivery_phone": "0712345678"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_invalid_order_status_is_rejected():
    schema = OrderSchema()

    data = {
        "buyer_id": 1,
        "total_amount": "150000.00",
        "delivery_address": "Nairobi, Kenya",
        "delivery_phone": "0712345678",
        "status": "INVALID"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_order_delivery_address_is_required():
    schema = OrderSchema()

    data = {
        "buyer_id": 1,
        "total_amount": "150000.00",
        "delivery_phone": "0712345678"
    }

    with pytest.raises(ValidationError):
        schema.load(data)