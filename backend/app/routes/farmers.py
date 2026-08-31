from flask import Blueprint, request, jsonify

from app.extensions import db
from app.authz import require_role, current_user_id
from app.models.farmer import Farmer
from app.schemas.farmer_schema import (
    FarmerSchema,
    FarmerResponseSchema
)

farmer_bp = Blueprint(
    "farmers",
    __name__,
    url_prefix="/api/farmers"
)

farmer_schema = FarmerSchema()
farmer_response_schema = FarmerResponseSchema()
farmers_response_schema = FarmerResponseSchema(
    many=True
)


@farmer_bp.route("", methods=["POST"])
@require_role("FARMER")
def create_farmer():
    try:
        data = farmer_schema.load(request.get_json(silent=True) or {})
    except Exception as error:
        return jsonify({"error": "Invalid farmer data", "details": getattr(error, "messages", str(error))}), 400
    if data["user_id"] != current_user_id():
        return jsonify({"error": "You can only create your own farmer profile"}), 403
    if Farmer.query.filter_by(user_id=current_user_id()).first():
        return jsonify({"error": "Farmer profile already exists"}), 409

    farmer = Farmer(**data)

    db.session.add(farmer)
    db.session.commit()

    return jsonify(
        farmer_response_schema.dump(farmer)
    ), 201


@farmer_bp.route("", methods=["GET"])
def get_farmers():
    page = max(request.args.get("page", 1, type=int), 1)
    per_page = min(max(request.args.get("per_page", 20, type=int), 1), 100)
    pagination = Farmer.query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "farmers": farmers_response_schema.dump(pagination.items),
        "total_pages": pagination.pages,
        "total_count": pagination.total,
        "current_page": pagination.page,
    }), 200


@farmer_bp.route("/<int:farmer_id>", methods=["GET"])
def get_farmer(farmer_id):

    farmer = db.session.get(Farmer, farmer_id)

    if not farmer:
        return jsonify({
            "error": "Farmer not found"
        }), 404

    return jsonify(
        farmer_response_schema.dump(farmer)
    ), 200


@farmer_bp.route("/<int:farmer_id>", methods=["PUT"])
@require_role("FARMER")
def update_farmer(farmer_id):

    farmer = db.session.get(Farmer, farmer_id)

    if not farmer:
        return jsonify({
            "error": "Farmer not found"
        }), 404
    if farmer.user_id != current_user_id():
        return jsonify({"error": "You can only update your own farmer profile"}), 403

    try:
        data = farmer_schema.load(request.get_json(silent=True) or {})
    except Exception as error:
        return jsonify({"error": "Invalid farmer data", "details": getattr(error, "messages", str(error))}), 400
    if data["user_id"] != farmer.user_id:
        return jsonify({"error": "A farmer profile cannot be reassigned"}), 400

    for key, value in data.items():
        setattr(farmer, key, value)

    db.session.commit()

    return jsonify(
        farmer_response_schema.dump(farmer)
    ), 200


@farmer_bp.route("/<int:farmer_id>", methods=["DELETE"])
@require_role("FARMER")
def delete_farmer(farmer_id):

    farmer = db.session.get(Farmer, farmer_id)

    if not farmer:
        return jsonify({
            "error": "Farmer not found"
        }), 404
    if farmer.user_id != current_user_id():
        return jsonify({"error": "You can only delete your own farmer profile"}), 403

    db.session.delete(farmer)
    db.session.commit()

    return jsonify({
        "message": "Farmer deleted successfully"
    }), 200
