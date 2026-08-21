from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.animal_image import AnimalImage
from app.schemas.animal_image_schema import (
    AnimalImageSchema,
    AnimalImageResponseSchema
)

animal_image_bp = Blueprint(
    "animal_images",
    __name__,
    url_prefix="/api/animal-images"
)

schema = AnimalImageSchema()
response_schema = AnimalImageResponseSchema()


@animal_image_bp.route("", methods=["POST"])
def add_animal_image():

    data = schema.load(
        request.get_json()
    )

    image = AnimalImage(**data)

    db.session.add(image)
    db.session.commit()

    return jsonify(
        response_schema.dump(image)
    ), 201


