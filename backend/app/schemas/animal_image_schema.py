from marshmallow import fields, validate
from flask_marshmallow import Marshmallow

ma = Marshmallow()


class AnimalImageSchema(ma.Schema):

    image_url = fields.String(
        required=True,
        validate=validate.Length(
            min=1,
            max=500
        )
    )

    is_primary = fields.Boolean(
        load_default=False
    )


class AnimalImageResponseSchema(ma.Schema):

    id = fields.Integer()

    animal_id = fields.Integer()

    image_url = fields.String()

    is_primary = fields.Boolean()

    created_at = fields.DateTime()
