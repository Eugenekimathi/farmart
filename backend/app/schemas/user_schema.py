from marshmallow import Schema, fields, validate, validates_schema, ValidationError


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

    farm_name = fields.Str(required=False, validate=validate.Length(min=2, max=150))
    farm_location = fields.Str(required=False, validate=validate.Length(min=2, max=150))
    farm_description = fields.Str(required=False, allow_none=True)

    @validates_schema
    def validate_farmer_profile(self, data, **kwargs):
        if data.get("role") == "FARMER":
            required = ("farm_name", "farm_location")
            errors = {field: ["This field is required for farmer registration."] for field in required if not data.get(field)}
            if errors:
                raise ValidationError(errors)


class UserResponseSchema(Schema):
    id = fields.Int()
    full_name = fields.Str()
    email = fields.Email()
    phone = fields.Str()
    role = fields.Str()
    location = fields.Str()
    created_at = fields.DateTime()
