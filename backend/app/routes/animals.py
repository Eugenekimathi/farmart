from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity

from app.extensions import db
from app.authz import require_role
from app.models.animals import Animal
from app.models.farmer import Farmer
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
@require_role("USER", "BUYER", "FARMER", "farmer")
def create_animal():
    from flask_jwt_extended import get_jwt_identity
    
    user_id = get_jwt_identity()
    
    # Get farmer profile for this user
    farmer = Farmer.query.filter_by(user_id=user_id).first()
    if not farmer:
        return jsonify({"error": "Farmer profile not found"}), 404
    
    data = schema.load(request.get_json())
    
    # Set farmer_id to the current user's farmer profile
    data['farmer_id'] = farmer.id
    
    animal = Animal(**data)
    
    db.session.add(animal)
    db.session.commit()
    
    return jsonify(
        response_schema.dump(animal)
    ), 201

@animal_bp.route("", methods=["GET"])
def get_animals():
    page = max(request.args.get("page", 1, type=int), 1)
    per_page = min(max(request.args.get("per_page", 9, type=int), 1), 100)
    pagination = Animal.query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "animals": many_response_schema.dump(pagination.items),
        "total_pages": pagination.pages,
        "total_count": pagination.total,
        "current_page": pagination.page,
    }), 200

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
@require_role("FARMER", "farmer")
def update_animal(animal_id):
    from flask_jwt_extended import get_jwt_identity
    
    user_id = get_jwt_identity()
    
    # Get farmer profile for this user
    farmer = Farmer.query.filter_by(user_id=user_id).first()
    if not farmer:
        return jsonify({"error": "Farmer profile not found"}), 404

    animal = db.session.get(
        Animal,
        animal_id
    )

    if not animal:
        return jsonify({
            "error": "Animal not found"
        }), 404
    
    # Verify farmer owns this animal
    if animal.farmer_id != farmer.id:
        return jsonify({
            "error": "You can only edit your own animals"
        }), 403

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
@require_role("FARMER", "farmer")
def delete_animal(animal_id):
    from flask_jwt_extended import get_jwt_identity
    
    user_id = get_jwt_identity()
    
    # Get farmer profile for this user
    farmer = Farmer.query.filter_by(user_id=user_id).first()
    if not farmer:
        return jsonify({"error": "Farmer profile not found"}), 404

    animal = db.session.get(
        Animal,
        animal_id
    )

    if not animal:
        return jsonify({
            "error": "Animal not found"
        }), 404
    
    # Verify farmer owns this animal
    if animal.farmer_id != farmer.id:
        return jsonify({
            "error": "You can only delete your own animals"
        }), 403

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

    page = max(request.args.get("page", 1, type=int), 1)
    per_page = min(max(request.args.get("per_page", 9, type=int), 1), 100)
    pagination = query.filter_by(status="AVAILABLE").paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        "animals": many_response_schema.dump(pagination.items),
        "total_pages": pagination.pages,
        "total_count": pagination.total,
        "current_page": pagination.page,
    }), 200

