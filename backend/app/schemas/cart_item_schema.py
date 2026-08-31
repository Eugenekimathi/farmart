from marshmallow import Schema, fields
from app.schemas.animal_schema import AnimalResponseSchema


class CartItemSchema(Schema):

    # The path is authoritative; retained for older clients.
    cart_id = fields.Int(required=True, load_only=True)

    animal_id = fields.Int(
        required=True
    )


class CartItemResponseSchema(Schema):

    id = fields.Int()
    cart_id = fields.Int()
    animal_id = fields.Int()
    animal = fields.Nested(AnimalResponseSchema)
