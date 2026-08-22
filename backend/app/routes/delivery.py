from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.delivery import Delivery
from app.models.order import Order
from app.schemas.delivery_schema import (
    DeliverySchema,
    DeliveryResponseSchema
)

delivery_bp = Blueprint(
    "deliveries",
    __name__,
    url_prefix="/api/deliveries"
)

schema = DeliverySchema()
response_schema = DeliveryResponseSchema()
many_response_schema = DeliveryResponseSchema(many=True)

@delivery_bp.route("", methods=["POST"])
def create_delivery():

    data = schema.load(
        request.get_json()
    )

    order = db.session.get(
        Order,
        data["order_id"]
    )

    if not order:
        return jsonify({
            "error": "Order not found"
        }), 404

    delivery = Delivery(**data)

    db.session.add(delivery)
    db.session.commit()

    return jsonify(
        response_schema.dump(delivery)
    ), 201

@delivery_bp.route("", methods=["GET"])
def get_deliveries():

    deliveries = Delivery.query.all()

    return jsonify(
        many_response_schema.dump(deliveries)
    ), 200


@delivery_bp.route(
    "/<int:delivery_id>",
    methods=["GET"]
)
def get_delivery(delivery_id):

    delivery = db.session.get(
        Delivery,
        delivery_id
    )

    if not delivery:
        return jsonify({
            "error": "Delivery not found"
        }), 404

    return jsonify(
        response_schema.dump(delivery)
    ), 200

@delivery_bp.route(
    "/<int:delivery_id>/status",
    methods=["PATCH"]
)
def update_delivery_status(delivery_id):

    delivery = db.session.get(
        Delivery,
        delivery_id
    )

    if not delivery:
        return jsonify({
            "error": "Delivery not found"
        }), 404

    data = request.get_json()

    status = data.get("status")

    allowed_statuses = [
        "PENDING",
        "PROCESSING",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED"
    ]

    if status not in allowed_statuses:
        return jsonify({
            "error": "Invalid delivery status"
        }), 400

    delivery.status = status

    db.session.commit()

    return jsonify(
        response_schema.dump(delivery)
    ), 200