import pytest
from marshmallow import ValidationError
from decimal import Decimal

from app.schemas.payment_schema import PaymentSchema


def test_valid_payment():
    schema = PaymentSchema()

    data = {
        "order_id": 1,
        "amount": "100000.00",
        "payment_method": "MPESA"
    }

    result = schema.load(data)

    assert result["order_id"] == 1
    assert result["amount"] == Decimal("100000.00")
    assert result["payment_method"] == "MPESA"
    assert result["status"] == "PENDING"


def test_payment_status_defaults_to_pending():
    schema = PaymentSchema()

    data = {
        "order_id": 1,
        "amount": "100000.00",
        "payment_method": "MPESA"
    }

    result = schema.load(data)

    assert result["status"] == "PENDING"


def test_invalid_payment_method_is_rejected():
    schema = PaymentSchema()

    data = {
        "order_id": 1,
        "amount": "100000.00",
        "payment_method": "CASH"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_invalid_payment_status_is_rejected():
    schema = PaymentSchema()

    data = {
        "order_id": 1,
        "amount": "100000.00",
        "payment_method": "MPESA",
        "status": "COMPLETED"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_payment_amount_must_be_positive():
    schema = PaymentSchema()

    data = {
        "order_id": 1,
        "amount": "0",
        "payment_method": "MPESA"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_payment_transaction_reference_can_be_none():
    schema = PaymentSchema()

    data = {
        "order_id": 1,
        "amount": "100000.00",
        "payment_method": "MPESA",
        "transaction_reference": None
    }

    result = schema.load(data)

    assert result["transaction_reference"] is None