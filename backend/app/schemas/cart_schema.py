from marshmallow import Schema, fields
from app.schemas.cart_item_schema import CartItemResponseSchema


class CartSchema(Schema):

    user_id = fields.Int(
        required=True
    )


class CartResponseSchema(Schema):

    id = fields.Int()
    user_id = fields.Int()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    cart_items = fields.Nested(CartItemResponseSchema, many=True)
