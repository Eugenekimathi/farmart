from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.breed import Breed
from app.schemas.breed_schema import (
    BreedSchema,
    BreedResponseSchema
)

breed_bp = Blueprint(
    "breeds",
    __name__,
    url_prefix="/api/breeds"
)

schema = BreedSchema()
response_schema = BreedResponseSchema()
many_response_schema = BreedResponseSchema(
    many=True
)


@breed_bp.route("", methods=["POST"])
def create_breed():

    data = schema.load(request.get_json())

    breed = Breed(**data)

    db.session.add(breed)
    db.session.commit()

    return jsonify(
        response_schema.dump(breed)
    ), 201


@breed_bp.route("", methods=["GET"])
def get_breeds():

    breeds = Breed.query.all()

    return jsonify(
        many_response_schema.dump(breeds)
    ), 200


@breed_bp.route("/<int:breed_id>", methods=["GET"])
def get_breed(breed_id):

    breed = db.session.get(Breed, breed_id)

    if not breed:
        return jsonify({
            "error": "Breed not found"
        }), 404

    return jsonify(
        response_schema.dump(breed)
    ), 200

@breed_bp.route("/<int:breed_id>", methods=["PUT"])
def update_breed(breed_id):

    breed = db.session.get(Breed, breed_id)

    if not breed:
        return jsonify({
            "error": "Breed not found"
        }), 404

    data = schema.load(request.get_json())

    for key, value in data.items():
        setattr(breed, key, value)

    db.session.commit()

    return jsonify(
        response_schema.dump(breed)
    ), 200


@breed_bp.route("/<int:breed_id>", methods=["DELETE"])
def delete_breed(breed_id):

    breed = db.session.get(Breed, breed_id)

    if not breed:
        return jsonify({
            "error": "Breed not found"
        }), 404

    db.session.delete(breed)
    db.session.commit()

    return jsonify({
        "message": "Breed deleted successfully"
    }), 200