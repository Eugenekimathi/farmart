from marshmallow import Schema, fields, validate


class BreedSchema(Schema):
    animal_type_id = fields.Int(
        required=True
    )

    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100)
    )

    description = fields.Str(
        required=False,
        allow_none=True
    )


class BreedResponseSchema(Schema):
    id = fields.Int()
    animal_type_id = fields.Int()
    name = fields.Str()
    description = fields.Str(allow_none=True)