from marshmallow import Schema, fields, validate


class AnimalTypeSchema(Schema):
    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=50)
    )

    description = fields.Str(
        required=False,
        allow_none=True
    )


class AnimalTypeResponseSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    description = fields.Str(allow_none=True)