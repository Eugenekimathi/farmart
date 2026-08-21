from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.animal_type import AnimalType
from app.schemas.animal_type_schema import (
    AnimalTypeSchema,
    AnimalTypeResponseSchema
)

animal_type_bp = Blueprint(
    "animal_types",
    __name__,
    url_prefix="/api/animal-types"
)

schema = AnimalTypeSchema()
response_schema = AnimalTypeResponseSchema()
many_response_schema = AnimalTypeResponseSchema(
    many=True
)


@animal_type_bp.route("", methods=["POST"])
def create_animal_type():

    data = schema.load(request.get_json())

    animal_type = AnimalType(**data)

    db.session.add(animal_type)
    db.session.commit()

    return jsonify(
        response_schema.dump(animal_type)
    ), 201


@animal_type_bp.route("", methods=["GET"])
def get_animal_types():

    animal_types = AnimalType.query.all()

    return jsonify(
        many_response_schema.dump(animal_types)
    ), 200

@animal_type_bp.route("/<int:animal_type_id>", methods=["GET"])
def get_animal_type(animal_type_id):

    animal_type = db.session.get(AnimalType, animal_type_id)

    if not animal_type:
        return jsonify({
            "error": "Animal type not found"
        }), 404

    return jsonify(
        response_schema.dump(animal_type)
    ), 200

@animal_type_bp.route("/<int:animal_type_id>", methods=["PUT"])
def update_animal_type(animal_type_id):

    animal_type = db.session.get(AnimalType, animal_type_id)

    if not animal_type:
        return jsonify({
            "error": "Animal type not found"
        }), 404

    data = schema.load(request.get_json())

    for key, value in data.items():
        setattr(animal_type, key, value)

    db.session.commit()

    return jsonify(
        response_schema.dump(animal_type)
    ), 200

@animal_type_bp.route("/<int:animal_type_id>", methods=["DELETE"])
def delete_animal_type(animal_type_id):

    animal_type = db.session.get(AnimalType, animal_type_id)

    if not animal_type:
        return jsonify({
            "error": "Animal type not found"
        }), 404

    db.session.delete(animal_type)
    db.session.commit()

    return jsonify({
        "message": "Animal type deleted successfully"
    }), 200