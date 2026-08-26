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

    page = max(request.args.get("page", 1, type=int), 1)
    per_page = min(max(request.args.get("per_page", 20, type=int), 1), 100)
    pagination = Order.query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "orders": many_response_schema.dump(pagination.items),
        "total_pages": pagination.pages,
        "total_count": pagination.total,
        "current_page": pagination.page,
    }), 200

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
        return jsonify({"error": "You can only update your own orders"}), 403
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

    role = (get_jwt().get("role") or "").upper()
    if status in {"CONFIRMED", "REJECTED"} and role != "FARMER":
        return jsonify({"error": "Only farmers may confirm or reject orders"}), 403
    if status == "CANCELLED" and role != "BUYER":
        return jsonify({"error": "Only buyers may cancel orders"}), 403
    order.status = status

    db.session.commit()

    return jsonify(
        response_schema.dump(order)
    ), 200
