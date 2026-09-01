from marshmallow import Schema, fields, validate


class AssistantChatSchema(Schema):
    message = fields.Str(required=True, validate=validate.Length(min=1, max=2000))
    conversation_id = fields.Str(required=False, allow_none=True, validate=validate.Length(max=100))
