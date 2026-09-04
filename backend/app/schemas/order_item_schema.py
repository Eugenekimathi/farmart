from marshmallow import Schema, fields, validate


class OrderItemSchema(Schema):

    order_id = fields.Int(
        required=True
    )

    animal_id = fields.Int(
        required=True
    )

    farmer_id = fields.Int(
        required=True
    )

    price = fields.Decimal(
        required=True,
        as_string=True,
        validate=validate.Range(
            min=0.01
        )
    )

    quantity = fields.Int(
        required=True,
        validate=validate.Range(
            min=1
        )
    )


class OrderItemResponseSchema(Schema):

    id = fields.Int()
    order_id = fields.Int()
    animal_id = fields.Int()
    farmer_id = fields.Int()
    price = fields.Decimal(as_string=True)
    quantity = fields.Int()