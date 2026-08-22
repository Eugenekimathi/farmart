from marshmallow import Schema, fields


class CartItemSchema(Schema):

    cart_id = fields.Int(
        required=True
    )

    animal_id = fields.Int(
        required=True
    )


class CartItemResponseSchema(Schema):

    id = fields.Int()
    cart_id = fields.Int()
    animal_id = fields.Int()
    created_at = fields.DateTime()