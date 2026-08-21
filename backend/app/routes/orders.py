from flask import Blueprint, request, jsonify

from app.extensions import db
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
def get_orders():

    orders = Order.query.all()

    return jsonify(
        many_response_schema.dump(orders)
    ), 200

@order_bp.route("/<int:order_id>", methods=["GET"])
def get_order(order_id):

    order = db.session.get(
        Order,
        order_id
    )

    if not order:
        return jsonify({
            "error": "Order not found"
        }), 404

    return jsonify(
        response_schema.dump(order)
    ), 200

@order_bp.route(
    "/<int:order_id>/status",
    methods=["PATCH"]
)
def update_order_status(order_id):

    order = db.session.get(
        Order,
        order_id
    )

    if not order:
        return jsonify({
            "error": "Order not found"
        }), 404

    data = request.get_json()

    status = data.get("status")

    allowed_statuses = [
        "CONFIRMED",
        "REJECTED",
        "CANCELLED"
    ]

    if status not in allowed_statuses:
        return jsonify({
            "error": "Invalid order status"
        }), 400

    order.status = status

    db.session.commit()

    return jsonify(
        response_schema.dump(order)
    ), 200
