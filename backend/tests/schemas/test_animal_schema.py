import pytest
from marshmallow import ValidationError

from app.schemas.animal_schema import (
    AnimalSchema,
    AnimalResponseSchema
)


def test_valid_animal():
    schema = AnimalSchema()

    data = {
        "farmer_id": 1,
        "animal_type_id": 1,
        "breed_id": 1,
        "name": "Cow 001",
        "gender": "FEMALE",
        "age": 3,
        "price": "100000.00",
        "description": "Healthy dairy cow",
        "location": "Nairobi",
        "status": "AVAILABLE"
    }

    result = schema.load(data)

    assert result["farmer_id"] == 1
    assert result["name"] == "Cow 001"
    assert result["gender"] == "FEMALE"
    assert result["age"] == 3
    assert result["status"] == "AVAILABLE"


def test_animal_status_defaults_to_available():
    schema = AnimalSchema()

    data = {
        "farmer_id": 1,
        "animal_type_id": 1,
        "breed_id": 1,
        "name": "Cow 001",
        "gender": "FEMALE",
        "age": 3,
        "price": "100000.00",
        "location": "Nairobi"
    }

    result = schema.load(data)

    assert result["status"] == "AVAILABLE"


def test_invalid_animal_gender_is_rejected():
    schema = AnimalSchema()

    data = {
        "farmer_id": 1,
        "animal_type_id": 1,
        "breed_id": 1,
        "name": "Cow 001",
        "gender": "UNKNOWN",
        "age": 3,
        "price": "100000.00",
        "location": "Nairobi"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_negative_animal_age_is_rejected():
    schema = AnimalSchema()

    data = {
        "farmer_id": 1,
        "animal_type_id": 1,
        "breed_id": 1,
        "name": "Cow 001",
        "gender": "FEMALE",
        "age": -1,
        "price": "100000.00",
        "location": "Nairobi"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_animal_age_above_50_is_rejected():
    schema = AnimalSchema()

    data = {
        "farmer_id": 1,
        "animal_type_id": 1,
        "breed_id": 1,
        "name": "Cow 001",
        "gender": "FEMALE",
        "age": 51,
        "price": "100000.00",
        "location": "Nairobi"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_animal_zero_or_negative_price_is_rejected():
    schema = AnimalSchema()

    data = {
        "farmer_id": 1,
        "animal_type_id": 1,
        "breed_id": 1,
        "name": "Cow 001",
        "gender": "FEMALE",
        "age": 3,
        "price": "0",
        "location": "Nairobi"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_invalid_animal_status_is_rejected():
    schema = AnimalSchema()

    data = {
        "farmer_id": 1,
        "animal_type_id": 1,
        "breed_id": 1,
        "name": "Cow 001",
        "gender": "FEMALE",
        "age": 3,
        "price": "100000.00",
        "location": "Nairobi",
        "status": "DELETED"
    }

    with pytest.raises(ValidationError):
        schema.load(data)