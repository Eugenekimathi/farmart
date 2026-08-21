from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.animal import Animal
from app.schemas.animal_schema import (
    AnimalSchema,
    AnimalResponseSchema
)

animal_bp = Blueprint(
    "animals",
    __name__,
    url_prefix="/api/animals"
)

schema = AnimalSchema()
response_schema = AnimalResponseSchema()
many_response_schema = AnimalResponseSchema(
    many=True
)

@animal_bp.route("", methods=["POST"])
def create_animal():

    data = schema.load(
        request.get_json()
    )

    animal = Animal(**data)

    db.session.add(animal)
    db.session.commit()

    return jsonify(
        response_schema.dump(animal)
    ), 201

@animal_bp.route("", methods=["GET"])
def get_animals():

    animals = Animal.query.all()

    return jsonify(
        many_response_schema.dump(animals)
    ), 200

@animal_bp.route("/<int:animal_id>", methods=["GET"])
def get_animal(animal_id):

    animal = db.session.get(
        Animal,
        animal_id
    )

    if not animal:
        return jsonify({
            "error": "Animal not found"
        }), 404

    return jsonify(
        response_schema.dump(animal)
    ), 200

@animal_bp.route("/<int:animal_id>", methods=["PUT"])
def update_animal(animal_id):

    animal = db.session.get(
        Animal,
        animal_id
    )

    if not animal:
        return jsonify({
            "error": "Animal not found"
        }), 404

    data = schema.load(
        request.get_json()
    )

    for key, value in data.items():
        setattr(animal, key, value)

    db.session.commit()

    return jsonify(
        response_schema.dump(animal)
    ), 200

@animal_bp.route("/<int:animal_id>", methods=["DELETE"])
def delete_animal(animal_id):

    animal = db.session.get(
        Animal,
        animal_id
    )

    if not animal:
        return jsonify({
            "error": "Animal not found"
        }), 404

    db.session.delete(animal)
    db.session.commit()

    return jsonify({
        "message": "Animal deleted successfully"
    }), 200

@animal_bp.route("/search", methods=["GET"])
def search_animals():

    animal_type_id = request.args.get(
        "animal_type_id",
        type=int
    )

    breed_id = request.args.get(
        "breed_id",
        type=int
    )

    min_age = request.args.get(
        "min_age",
        type=int
    )

    max_age = request.args.get(
        "max_age",
        type=int
    )

    query = Animal.query

    if animal_type_id:
        query = query.filter_by(
            animal_type_id=animal_type_id
        )

    if breed_id:
        query = query.filter_by(
            breed_id=breed_id
        )

    if min_age is not None:
        query = query.filter(
            Animal.age >= min_age
        )

    if max_age is not None:
        query = query.filter(
            Animal.age <= max_age
        )

    animals = query.filter_by(
        status="AVAILABLE"
    ).all()

    return jsonify(
        many_response_schema.dump(animals)
    ), 200

