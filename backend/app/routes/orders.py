from flask import Blueprint, request, jsonify

from flask_jwt_extended import get_jwt
from app.extensions import db
from app.authz import authenticated, current_user_id
from app.models.order import Order
from app.schemas.order_schema import (
    OrderSchema,
    OrderResponseSchema
)

order_bp = Blueprint(
    "orders",
    __name__,
    url_prefix="/api/orders"
)

schema = OrderSchema()
response_schema = OrderResponseSchema()
many_response_schema = OrderResponseSchema(
    many=True
)

@order_bp.route("", methods=["POST"])
@authenticated
def create_order():

    data = schema.load(
        request.get_json()
    )

    order = Order(**data)

    db.session.add(order)
    db.session.commit()

    return jsonify(
        response_schema.dump(order)
    ), 201

@order_bp.route("", methods=["GET"])
@authenticated
def get_orders():

    orders = Order.query.all()

    return jsonify(
        many_response_schema.dump(orders)
    ), 200

@order_bp.route("/<int:order_id>", methods=["GET"])
@authenticated
def get_order(order_id):

    order = db.session.get(
        Order,
        order_id
    )

    if not order:
        return jsonify({
            "error": "Order not found"
        }), 404
    role = (get_jwt().get("role") or "").upper()
    if role != "FARMER" and order.buyer_id != current_user_id():
        return jsonify({"error": "You can only view your own orders"}), 403
    return jsonify(
        response_schema.dump(order)
    ), 200

@order_bp.route(
    "/<int:order_id>/status",
    methods=["PATCH"]
)
@authenticated
def update_order_status(order_id):

    order = db.session.get(Order, order_id)

    if not order:
        return jsonify({
            "error": "Order not found"
        }), 404
    role = (get_jwt().get("role") or "").upper()
    if role != "FARMER" and order.buyer_id != current_user_id():
        return jsonify({"error": "You can only update your own orders"}), 403
    data = request.get_json()

    new_status = data.get("status")

    allowed_statuses = [
        "PENDING",
        "CONFIRMED",
        "REJECTED",
        "CANCELLED",
        "COMPLETED"
    ]

    if new_status not in allowed_statuses:
        return jsonify({
            "error": "Invalid order status"
        }), 400

    role = (get_jwt().get("role") or "").upper()
    if new_status in {"CONFIRMED", "REJECTED"} and role != "FARMER":
        return jsonify({"error": "Only farmers may confirm or reject orders"}), 403
    if new_status == "CANCELLED" and role != "BUYER":
        return jsonify({"error": "Only buyers may cancel orders"}), 403

    allowed_transitions = {
        "PENDING": [
            "CONFIRMED",
            "REJECTED",
            "CANCELLED"
        ],
        "CONFIRMED": [
            "COMPLETED",
            "CANCELLED"
        ],
        "REJECTED": [],
        "CANCELLED": [],
        "COMPLETED": []
    }

    if new_status not in allowed_transitions.get(
        order.status,
        []
    ):
        return jsonify({
            "error": (
                f"Cannot change order status "
                f"from {order.status} to {new_status}"
            )
        }), 409

    order.status = new_status

    db.session.commit()

    return jsonify(
        response_schema.dump(order)
    ), 200
