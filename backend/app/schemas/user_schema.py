from marshmallow import Schema, fields, validate


class UserRegisterSchema(Schema):
    full_name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100)
    )

    email = fields.Email(
        required=True
    )

    phone = fields.Str(
        required=True,
        validate=validate.Length(min=10, max=20)
    )

    password = fields.Str(
        required=True,
        load_only=True,
        validate=validate.Length(min=8, max=128)
    )

    role = fields.Str(
        required=True,
        validate=validate.OneOf([
            "BUYER",
            "FARMER"
        ])
    )

    location = fields.Str(
        required=False,
        allow_none=True,
        validate=validate.Length(max=150)
    )


class UserResponseSchema(Schema):
    id = fields.Int()
    full_name = fields.Str()
    email = fields.Email()
    phone = fields.Str()
    role = fields.Str()
    location = fields.Str()
    created_at = fields.DateTime()