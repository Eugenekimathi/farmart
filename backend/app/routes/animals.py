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