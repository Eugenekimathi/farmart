from marshmallow import Schema, fields, validate


class PaymentSchema(Schema):

    order_id = fields.Int(
        required=True
    )

    amount = fields.Decimal(
        required=True,
        as_string=True,
        validate=validate.Range(
            min=0.01
        )
    )

    payment_method = fields.Str(
        required=True,
        validate=validate.OneOf([
            "MPESA",
            "CARD",
            "BANK_TRANSFER"
        ])
    )

    transaction_reference = fields.Str(
        required=False,
        allow_none=True,
        validate=validate.Length(
            min=5,
            max=100
        )
    )

    status = fields.Str(
        required=False,
        load_default="PENDING",
        validate=validate.OneOf([
            "PENDING",
            "SUCCESS",
            "FAILED",
            "CANCELLED"
        ])
    )


class PaymentResponseSchema(Schema):

    id = fields.Int()
    order_id = fields.Int()
    amount = fields.Decimal(as_string=True)
    payment_method = fields.Str()
    transaction_reference = fields.Str(
        allow_none=True
    )
    status = fields.Str()
    paid_at = fields.DateTime(
        allow_none=True
    )
    created_at = fields.DateTime()