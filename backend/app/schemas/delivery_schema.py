from marshmallow import Schema, fields, validate


class DeliverySchema(Schema):

    order_id = fields.Int(
        required=True
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
            "PROCESSING",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED"
        ])
    )

    tracking_reference = fields.Str(
        required=False,
        allow_none=True,
        validate=validate.Length(
            min=5,
            max=100
        )
    )

    scheduled_date = fields.Date(
        required=False,
        allow_none=True
    )


class DeliveryResponseSchema(Schema):

    id = fields.Int()
    order_id = fields.Int()
    delivery_address = fields.Str()
    delivery_phone = fields.Str()
    status = fields.Str()
    tracking_reference = fields.Str(
        allow_none=True
    )
    scheduled_date = fields.Date(
        allow_none=True
    )
    delivered_at = fields.DateTime(
        allow_none=True
    )
    created_at = fields.DateTime()