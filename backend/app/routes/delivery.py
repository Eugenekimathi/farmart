from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from app.extensions import db
from flask_jwt_extended import get_jwt
from app.authz import authenticated, current_user_id, current_farmer
from app.models.order_item import OrderItem
from app.services.delivery_service import update_status as transition_delivery_status
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


def can_access_delivery(delivery):
    if delivery.order.buyer_id == current_user_id():
        return True
    farmer = current_farmer()
    return bool(farmer and any(item.farmer_id == farmer.id for item in delivery.order.order_items))

@delivery_bp.route("", methods=["POST"])
@authenticated
def create_delivery():

    try:
        data = schema.load(
            request.get_json()
        )
    except ValidationError as err:
        return jsonify({
            "errors": err.messages
        }), 400

    order = db.session.get(
        Order,
        data["order_id"]
    )

    if not order:
        return jsonify({
            "error": "Order not found"
        }), 404
    if order.buyer_id != current_user_id():
        return jsonify({"error": "You can only create deliveries for your own orders"}), 403

    existing_delivery = Delivery.query.filter_by(
        order_id=data["order_id"]
    ).first()

    if existing_delivery:
        return jsonify({
            "error": "Delivery already exists for this order"
        }), 409

    delivery = Delivery(**data)

    db.session.add(delivery)
    db.session.commit()

    return jsonify(
        response_schema.dump(delivery)
    ), 201

@delivery_bp.route("", methods=["GET"])
@authenticated
def get_deliveries():
    role = (get_jwt().get("role") or "").upper()
    if role == "FARMER":
        farmer = current_farmer()
        deliveries = (Delivery.query.join(Order).join(OrderItem)
                      .filter(OrderItem.farmer_id == farmer.id).distinct().all()) if farmer else []
    else:
        deliveries = Delivery.query.join(Order).filter(Order.buyer_id == current_user_id()).all()

    return jsonify(
        many_response_schema.dump(deliveries)
    ), 200


@delivery_bp.route(
    "/<int:delivery_id>",
    methods=["GET"]
)
@authenticated
def get_delivery(delivery_id):

    delivery = db.session.get(
        Delivery,
        delivery_id
    )

    if not delivery:
        return jsonify({
            "error": "Delivery not found"
        }), 404
    if not can_access_delivery(delivery):
        return jsonify({"error": "You can only view deliveries for your own orders"}), 403

    return jsonify(
        response_schema.dump(delivery)
    ), 200

@delivery_bp.route(
    "/<int:delivery_id>/status",
    methods=["PATCH"]
)
@authenticated
def update_delivery_status(delivery_id):

    delivery = db.session.get(
        Delivery,
        delivery_id
    )

    if not delivery:
        return jsonify({
            "error": "Delivery not found"
        }), 404
    farmer = current_farmer()
    if not farmer or not any(item.farmer_id == farmer.id for item in delivery.order.order_items):
        return jsonify({"error": "Only a farmer on the order may update delivery status"}), 403

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

    try:
        transition_delivery_status(delivery_id, status)
    except ValueError as error:
        return jsonify({"error": str(error)}), 409

    return jsonify(
        response_schema.dump(delivery)
    ), 200
