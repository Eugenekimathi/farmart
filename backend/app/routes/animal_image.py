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
    url_prefix="/api/animals"    
)

schema = AnimalImageSchema()
response_schema = AnimalImageResponseSchema()
many_response_schema = AnimalImageResponseSchema(many=True)


@animal_image_bp.route("/<int:animal_id>/images", methods=["POST"])
def add_animal_image(animal_id):

    data = schema.load(request.get_json())

    image = AnimalImage(
        animal_id=animal_id,
        **data
    )

    db.session.add(image)
    db.session.commit()

    return jsonify(
        response_schema.dump(image)
    ), 201

@animal_image_bp.route("/<int:animal_id>/images", methods=["GET"])
def get_animal_images(animal_id):

    images = AnimalImage.query.filter_by(
        animal_id=animal_id
    ).all()

    return jsonify(
        many_response_schema.dump(images)
    ), 200


@animal_image_bp.route(
    "/<int:animal_id>/images/<int:image_id>",
    methods=["DELETE"]
)
def delete_animal_image(animal_id, image_id):

    image = AnimalImage.query.filter_by(
        id=image_id,
        animal_id=animal_id
    ).first()

    if not image:
        return jsonify({
            "error": "Animal image not found"
        }), 404

    db.session.delete(image)
    db.session.commit()

    return jsonify({
        "message": "Animal image deleted successfully"
    }), 200


