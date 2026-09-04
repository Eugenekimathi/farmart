from marshmallow import Schema, fields, validate


class TransactionSchema(Schema):
    order_id = fields.Int(required=True)
    checkout_request_id = fields.Str(
        required=True,
        validate=validate.Length(min=5, max=100)
    )
    merchant_request_id = fields.Str(
        required=False,
        allow_none=True,
        validate=validate.Length(max=100)
    )
    phone_number = fields.Str(
        required=True,
        validate=validate.Length(min=10, max=20)
    )
    amount = fields.Decimal(
        required=True,
        as_string=True,
        validate=validate.Range(min=0.01)
    )
    status = fields.Str(
        required=False,
        load_default="PENDING",
        validate=validate.OneOf([
            "PENDING",
            "SUCCESS",
            "FAILED",
            "CANCELLED",
            "TIMEOUT"
        ])
    )


class TransactionResponseSchema(Schema):
    id = fields.Int()
    order_id = fields.Int()
    checkout_request_id = fields.Str()
    merchant_request_id = fields.Str(allow_none=True)
    phone_number = fields.Str()
    amount = fields.Decimal(as_string=True)
    status = fields.Str()
    result_code = fields.Str(allow_none=True)
    result_description = fields.Str(allow_none=True)
    receipt_number = fields.Str(allow_none=True)
    transaction_date = fields.DateTime(allow_none=True)
    created_at = fields.DateTime()
    updated_at = fields.DateTime()


class MpesaCallbackSchema(Schema):
    Body = fields.Dict(required=True)