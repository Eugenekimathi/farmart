import pytest
from marshmallow import ValidationError

from app.schemas.user_schema import (
    UserRegisterSchema,
    UserResponseSchema
)


def test_valid_user_registration():
    schema = UserRegisterSchema()

    data = {
        "full_name": "John Doe",
        "email": "john@test.com",
        "phone": "0712345678",
        "password": "password123",
        "role": "BUYER",
        "location": "Nairobi"
    }

    result = schema.load(data)

    assert result["full_name"] == "John Doe"
    assert result["email"] == "john@test.com"
    assert result["role"] == "BUYER"


def test_user_password_is_required():
    schema = UserRegisterSchema()

    data = {
        "full_name": "John Doe",
        "email": "john@test.com",
        "phone": "0712345678",
        "role": "BUYER"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_user_invalid_email_is_rejected():
    schema = UserRegisterSchema()

    data = {
        "full_name": "John Doe",
        "email": "invalid-email",
        "phone": "0712345678",
        "password": "password123",
        "role": "BUYER"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_user_short_password_is_rejected():
    schema = UserRegisterSchema()

    data = {
        "full_name": "John Doe",
        "email": "john@test.com",
        "phone": "0712345678",
        "password": "short",
        "role": "BUYER"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_user_invalid_role_is_rejected():
    schema = UserRegisterSchema()

    data = {
        "full_name": "John Doe",
        "email": "john@test.com",
        "phone": "0712345678",
        "password": "password123",
        "role": "ADMIN"
    }

    with pytest.raises(ValidationError):
        schema.load(data)


def test_user_response_does_not_include_password():
    schema = UserResponseSchema()

    data = {
        "id": 1,
        "full_name": "John Doe",
        "email": "john@test.com",
        "phone": "0712345678",
        "role": "BUYER",
        "location": "Nairobi"
    }

    result = schema.dump(data)

    assert "password" not in result