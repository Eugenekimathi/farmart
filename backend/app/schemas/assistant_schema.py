from marshmallow import Schema, fields, validate


class AssistantChatSchema(Schema):
    message = fields.Str(
        required=True,
        validate=validate.And(
            validate.Length(min=1, max=2000),
            validate.Regexp(r".*\S.*", error="Message cannot be blank."),
        ),
    )
    conversation_id = fields.Str(required=False, allow_none=True, validate=validate.Length(max=100))
