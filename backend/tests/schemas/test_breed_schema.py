import pytest
from marshmallow import ValidationError

from app.schemas.breed_schema import (
    BreedSchema,
    BreedResponseSchema
)


def test_valid_breed():
    schema = BreedSchema()

    data = {
        "animal_type_id": 1,
        "name": "Friesian",
        "description": "Dairy cattle breed"
    }

    result = schema.load(data)

    assert result["animal_type_id"] == 1
    assert result["name"] == "Friesian"


def test_breed_animal_type_id_is_required():
    schema = BreedSchema()

    data = {
        "name": "Friesian"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_breed_name_is_required():
    schema = BreedSchema()

    data = {
        "animal_type_id": 1
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_breed_short_name_is_rejected():
    schema = BreedSchema()

    data = {
        "animal_type_id": 1,
        "name": "F"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_breed_description_can_be_none():
    schema = BreedSchema()

    data = {
        "animal_type_id": 1,
        "name": "Friesian",
        "description": None
    }

    result = schema.load(data)

    assert result["description"] is None