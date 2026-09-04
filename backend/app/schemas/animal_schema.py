from marshmallow import Schema, fields, validate
class AnimalImageResponseSchema(Schema):
    id = fields.Int()
    image_url = fields.Str()
    is_primary = fields.Bool()
    created_at = fields.DateTime(allow_none=True)

class AnimalTypeSummarySchema(Schema):
    id = fields.Int()
    name = fields.Str()

class BreedSummarySchema(Schema):
    id = fields.Int()
    name = fields.Str()

class FarmerSummarySchema(Schema):
    id = fields.Int()
    farm_name = fields.Str()
    farm_location = fields.Str()

class AnimalSchema(Schema):

    farmer_id = fields.Int(
        required=False,
        allow_none=True
    )

    animal_type_id = fields.Int(
        required=True
    )

    breed_id = fields.Int(
        required=False,
        allow_none=True,
        load_default=None
    )

    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100)
    )

    gender = fields.Str(
        required=True,
        validate=validate.OneOf([
            "MALE",
            "FEMALE"
        ])
    )

    age = fields.Int(
        required=True,
        validate=validate.Range(
            min=0,
            max=50
        )
    )

    price = fields.Decimal(
        required=True,
        as_string=True,
        validate=validate.Range(
            min=0.01
        )
    )

    description = fields.Str(
        required=False,
        allow_none=True
    )

    location = fields.Str(
        required=True,
        validate=validate.Length(
            min=2,
            max=150
        )
    )

    status = fields.Str(
        required=False,
        load_default="AVAILABLE",
        validate=validate.OneOf([
            "AVAILABLE",
            "RESERVED",
            "SOLD",
            "INACTIVE"
        ])
    )


class AnimalResponseSchema(Schema):

    id = fields.Int()
    farmer_id = fields.Int()
    animal_type_id = fields.Int()
    breed_id = fields.Int(allow_none=True)
    animal_type = fields.Nested(AnimalTypeSummarySchema)
    breed = fields.Nested(BreedSummarySchema, allow_none=True)
    farmer = fields.Nested(FarmerSummarySchema)
    images = fields.Nested(AnimalImageResponseSchema, many=True)
    name = fields.Str()
    gender = fields.Str()
    age = fields.Int()
    price = fields.Decimal(as_string=True)
    description = fields.Str(allow_none=True)
    location = fields.Str()
    status = fields.Str()
    created_at = fields.DateTime(allow_none=True)
    updated_at = fields.DateTime(allow_none=True)