import pytest
from marshmallow import ValidationError

from app.schemas.farmer_schema import (
    FarmerSchema,
    FarmerResponseSchema
)


def test_valid_farmer():
    schema = FarmerSchema()

    data = {
        "user_id": 1,
        "farm_name": "Green Valley Farm",
        "farm_location": "Nairobi",
        "description": "Dairy farm"
    }

    result = schema.load(data)

    assert result["user_id"] == 1
    assert result["farm_name"] == "Green Valley Farm"


def test_farmer_user_id_is_required():
    schema = FarmerSchema()

    data = {
        "farm_name": "Green Valley Farm",
        "farm_location": "Nairobi"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_farmer_farm_name_is_required():
    schema = FarmerSchema()

    data = {
        "user_id": 1,
        "farm_location": "Nairobi"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_farmer_short_farm_name_is_rejected():
    schema = FarmerSchema()

    data = {
        "user_id": 1,
        "farm_name": "A",
        "farm_location": "Nairobi"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_farmer_description_can_be_none():
    schema = FarmerSchema()

    data = {
        "user_id": 1,
        "farm_name": "Green Valley Farm",
        "farm_location": "Nairobi",
        "description": None
    }

    result = schema.load(data)

    assert result["description"] is None