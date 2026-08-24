import pytest
from marshmallow import ValidationError

from app.schemas.delivery_schema import DeliverySchema


def test_valid_delivery():
    schema = DeliverySchema()

    data = {
        "order_id": 1,
        "delivery_address": "Nairobi, Kenya",
        "delivery_phone": "0712345678"
    }

    result = schema.load(data)

    assert result["order_id"] == 1
    assert result["delivery_address"] == "Nairobi, Kenya"
    assert result["status"] == "PENDING"


def test_delivery_status_defaults_to_pending():
    schema = DeliverySchema()

    data = {
        "order_id": 1,
        "delivery_address": "Nairobi, Kenya",
        "delivery_phone": "0712345678"
    }

    result = schema.load(data)

    assert result["status"] == "PENDING"


def test_invalid_delivery_status_is_rejected():
    schema = DeliverySchema()

    data = {
        "order_id": 1,
        "delivery_address": "Nairobi, Kenya",
        "delivery_phone": "0712345678",
        "status": "UNKNOWN"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_delivery_address_is_required():
    schema = DeliverySchema()

    data = {
        "order_id": 1,
        "delivery_phone": "0712345678"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_delivery_phone_is_required():
    schema = DeliverySchema()

    data = {
        "order_id": 1,
        "delivery_address": "Nairobi, Kenya"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_delivery_tracking_reference_can_be_none():
    schema = DeliverySchema()

    data = {
        "order_id": 1,
        "delivery_address": "Nairobi, Kenya",
        "delivery_phone": "0712345678",
        "tracking_reference": None
    }

    result = schema.load(data)

    assert result["tracking_reference"] is None