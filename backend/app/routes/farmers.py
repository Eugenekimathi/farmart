from flask import Blueprint, request, jsonify

from app.extensions import db
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
def create_farmer():

    data = farmer_schema.load(
        request.get_json()
    )

    farmer = Farmer(**data)

    db.session.add(farmer)
    db.session.commit()

    return jsonify(
        farmer_response_schema.dump(farmer)
    ), 201


@farmer_bp.route("", methods=["GET"])
def get_farmers():

    farmers = Farmer.query.all()

    return jsonify(
        farmers_response_schema.dump(farmers)
    ), 200


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
def update_farmer(farmer_id):

    farmer = db.session.get(Farmer, farmer_id)

    if not farmer:
        return jsonify({
            "error": "Farmer not found"
        }), 404

    data = farmer_response_schema.load(request.get_json())

    for key, value in data.items():
        setattr(farmer, key, value)

    db.session.commit()

    return jsonify(
        farmer_response_schema.dump(farmer)
    ), 200


@farmer_bp.route("/<int:farmer_id>", methods=["DELETE"])
def delete_farmer(farmer_id):

    farmer = db.session.get(Farmer, farmer_id)

    if not farmer:
        return jsonify({
            "error": "Farmer not found"
        }), 404

    db.session.delete(farmer)
    db.session.commit()

    return jsonify({
        "message": "Farmer deleted successfully"
    }), 200