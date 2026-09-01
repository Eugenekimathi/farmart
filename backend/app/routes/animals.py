from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from marshmallow import ValidationError
from app.extensions import db
from app.models.animal_image import AnimalImage
from app.models.animal_type import AnimalType
from app.models.breed import Breed
from app.services.image_storage_service import upload_animal_image

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
@require_role("FARMER", "farmer")
def create_animal():
    from flask_jwt_extended import get_jwt_identity

    user_id = get_jwt_identity()

    # Get farmer profile for this user
    farmer = Farmer.query.filter_by(user_id=user_id).first()
    if not farmer:
        return jsonify({"error": "Farmer profile not found"}), 404

    try:
        if request.content_type and "multipart/form-data" in request.content_type:
            raw = request.form.to_dict()
            raw.pop("primary_image_index", None)
            raw["breed_id"] = request.form.get("breed_id") or None
            raw["gender"] = (request.form.get("gender") or "").upper()
            raw["status"] = (request.form.get("status") or "AVAILABLE").upper()
            data = schema.load(raw)
            files = request.files.getlist("images")
        else:
            data = schema.load(request.get_json(silent=True) or {})
            files = []
        data["farmer_id"] = farmer.id
        animal_type = db.session.get(AnimalType, data["animal_type_id"])
        if not animal_type:
            return jsonify({"error": "Animal type not found"}), 400
        if data.get("breed_id") is not None:
            breed = db.session.get(Breed, data["breed_id"])
            if not breed or breed.animal_type_id != animal_type.id:
                return jsonify({"error": "Breed does not belong to the selected animal type"}), 400
        if len(files) > 5:
            return jsonify({"error": "You can upload a maximum of 5 images"}), 400
        animal = Animal(**data)
        db.session.add(animal)
        db.session.flush()
        primary_index = int(request.form.get("primary_image_index", 0)) if files else 0
        for index, file_storage in enumerate(files):
            db.session.add(AnimalImage(
                animal_id=animal.id,
                image_url=upload_animal_image(file_storage),
                is_primary=index == primary_index,
            ))
        db.session.commit()
    except (ValidationError, ValueError, TypeError) as error:
        db.session.rollback()
        return jsonify({"error": "Invalid animal data", "details": getattr(error, "messages", str(error))}), 400
    return jsonify(response_schema.dump(animal)), 201

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

    animal_type_value = request.args.get("animal_type_id")
    breed_value = request.args.get("breed_id")
    animal_type_id = int(animal_type_value) if animal_type_value and animal_type_value.isdigit() else None
    breed_id = int(breed_value) if breed_value and breed_value.isdigit() else None

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
        query = query.filter_by(animal_type_id=animal_type_id)
    elif animal_type_value:
        query = query.join(Animal.animal_type).filter(AnimalType.name.ilike(animal_type_value))

    if breed_id:
        query = query.filter_by(breed_id=breed_id)
    elif breed_value:
        query = query.join(Animal.breed).filter(Breed.name.ilike(breed_value))

    if min_age is not None:
        query = query.filter(
            Animal.age >= min_age
        )

    if max_age is not None:
        query = query.filter(Animal.age <= max_age)
    max_price = request.args.get("max_price", type=float)
    if max_price is not None:
        query = query.filter(Animal.price <= max_price)
    location = request.args.get("county") or request.args.get("location")
    if location:
        query = query.filter(Animal.location.ilike(f"%{location}%"))

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
