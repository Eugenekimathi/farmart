from marshmallow import Schema, fields, validate
class OrderAnimalSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    location = fields.Str()
    price = fields.Decimal(as_string=True)
    images = fields.Nested("OrderAnimalImageSchema", many=True)


class OrderAnimalImageSchema(Schema):
    image_url = fields.Str()
    is_primary = fields.Bool()


class OrderFarmerSchema(Schema):
    id = fields.Int()
    farm_name = fields.Str()
    farm_location = fields.Str()

class OrderItemResponseSchema(Schema):
    id = fields.Int()
    animal_id = fields.Int()
    farmer_id = fields.Int()
    price = fields.Decimal(as_string=True)
    quantity = fields.Int()
    animal = fields.Nested(OrderAnimalSchema)
    farmer = fields.Nested(OrderFarmerSchema)

class OrderSchema(Schema):

    buyer_id = fields.Int(
        required=False,
        allow_none=True,
        load_default=None
    )

    total_amount = fields.Decimal(
        required=True,
        as_string=True,
        validate=validate.Range(
            min=0.01
        )
    )

    delivery_address = fields.Str(
        required=True,
        validate=validate.Length(
            min=5,
            max=500
        )
    )

    delivery_phone = fields.Str(
        required=True,
        validate=validate.Length(
            min=10,
            max=20
        )
    )

    status = fields.Str(
        required=False,
        load_default="PENDING",
        validate=validate.OneOf([
            "PENDING",
            "CONFIRMED",
            "REJECTED",
            "PAID",
            "PROCESSING",
            "COMPLETED",
            "CANCELLED"
        ])
    )


class OrderResponseSchema(Schema):

    id = fields.Int()
    buyer_id = fields.Int()
    total_amount = fields.Decimal(as_string=True)
    status = fields.Str()
    delivery_address = fields.Str()
    delivery_phone = fields.Str()
    created_at = fields.DateTime()
    updated_at = fields.DateTime(allow_none=True)
    order_items = fields.Nested(OrderItemResponseSchema, many=True)
