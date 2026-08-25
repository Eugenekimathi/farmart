from marshmallow import Schema, fields, validate


class FarmerSchema(Schema):
    user_id = fields.Int(
        required=True
    )

    farm_name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=150)
    )

    farm_location = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=150)
    )

    description = fields.Str(
        required=False,
        allow_none=True
    )


class FarmerResponseSchema(Schema):
    id = fields.Int()
    user_id = fields.Int()
    farm_name = fields.Str()
    farm_location = fields.Str()
    description = fields.Str(allow_none=True)