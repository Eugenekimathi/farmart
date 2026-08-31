from flask import Blueprint, request, jsonify

from app.extensions import db
from flask_jwt_extended import get_jwt_identity
from app.authz import require_role
from app.models.animals import Animal
from app.models.farmer import Farmer
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
@require_role("FARMER", "farmer")
def add_animal_image(animal_id):
    farmer = Farmer.query.filter_by(user_id=get_jwt_identity()).first()
    animal = db.session.get(Animal, animal_id)
    if not animal:
        return jsonify({"error": "Animal not found"}), 404
    if not farmer or animal.farmer_id != farmer.id:
        return jsonify({"error": "You can only modify your own animal images"}), 403
    data = schema.load(request.get_json(silent=True) or {})
    if data.get("is_primary"):
        AnimalImage.query.filter_by(animal_id=animal_id).update({"is_primary": False})
    image = AnimalImage(animal_id=animal_id, **data)

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
@require_role("FARMER", "farmer")
def delete_animal_image(animal_id, image_id):
    farmer = Farmer.query.filter_by(user_id=get_jwt_identity()).first()
    animal = db.session.get(Animal, animal_id)
    if not animal:
        return jsonify({"error": "Animal not found"}), 404
    if not farmer or animal.farmer_id != farmer.id:
        return jsonify({"error": "You can only modify your own animal images"}), 403
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

