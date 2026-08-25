import pytest
from marshmallow import ValidationError

from app.schemas.animal_type_schema import (
    AnimalTypeSchema,
    AnimalTypeResponseSchema
)


def test_valid_animal_type():
    schema = AnimalTypeSchema()

    data = {
        "name": "Cattle",
        "description": "Cattle animals"
    }

    result = schema.load(data)

    assert result["name"] == "Cattle"
    assert result["description"] == "Cattle animals"


def test_animal_type_name_is_required():
    schema = AnimalTypeSchema()

    data = {
        "description": "Cattle animals"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_animal_type_short_name_is_rejected():
    schema = AnimalTypeSchema()

    data = {
        "name": "C"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_animal_type_description_can_be_none():
    schema = AnimalTypeSchema()

    data = {
        "name": "Cattle",
        "description": None
    }

    result = schema.load(data)

    assert result["description"] is None