from flask import Blueprint, request, jsonify

from flask_jwt_extended import get_jwt
from app.extensions import db
from app.authz import authenticated, current_user_id
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.cart import Cart
from app.models.farmer import Farmer
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

    try:
        data = schema.load(request.get_json(silent=True) or {})
    except Exception as err:
        if hasattr(err, "messages"):
            return jsonify({"errors": err.messages}), 400
        raise
    role = (get_jwt().get("role") or "").upper()
    if role == "FARMER":
        return jsonify({"error": "Only buyers can create orders"}), 403
    buyer_id = current_user_id()
    cart = Cart.query.filter_by(user_id=buyer_id).first()
    cart_items = list(cart.cart_items) if cart else []
    if any(item.animal.status != "AVAILABLE" for item in cart_items):
        return jsonify({"error": "One or more animals in the cart are no longer available"}), 409
    total_amount = sum((item.animal.price for item in cart_items), 0)
    if not cart_items:
        total_amount = data["total_amount"]
    order = Order(buyer_id=buyer_id, total_amount=total_amount,
                  delivery_address=data["delivery_address"],
                  delivery_phone=data["delivery_phone"], status="PENDING")
    db.session.add(order)
    db.session.flush()
    for cart_item in cart_items:
        animal = cart_item.animal
        db.session.add(OrderItem(order_id=order.id, animal_id=animal.id,
                                 farmer_id=animal.farmer_id, price=animal.price,
                                 quantity=1))
        animal.status = "RESERVED"
        db.session.delete(cart_item)
    db.session.commit()
    return jsonify(response_schema.dump(order)), 201

@order_bp.route("", methods=["GET"])
@authenticated
def get_orders():

    page = max(request.args.get("page", 1, type=int), 1)
    per_page = min(max(request.args.get("per_page", 20, type=int), 1), 100)
    role = (get_jwt().get("role") or "").upper()
    query = Order.query
    if role == "FARMER":
        farmer = Farmer.query.filter_by(user_id=current_user_id()).first()
        if not farmer:
            return jsonify({"orders": [], "total_pages": 0, "total_count": 0, "current_page": page}), 200
        query = query.join(OrderItem).filter(OrderItem.farmer_id == farmer.id).distinct()
    else:
        query = query.filter(Order.buyer_id == current_user_id())
    pagination = query.order_by(Order.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
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
    if role == "FARMER":
        farmer = Farmer.query.filter_by(user_id=current_user_id()).first()
        if not farmer or not any(item.farmer_id == farmer.id for item in order.order_items):
            return jsonify({"error": "You can only view orders for your animals"}), 403
    elif order.buyer_id != current_user_id():
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
    if role == "FARMER":
        farmer = Farmer.query.filter_by(user_id=current_user_id()).first()
        if not farmer or not any(item.farmer_id == farmer.id for item in order.order_items):
            return jsonify({"error": "You can only update orders for your animals"}), 403
    elif order.buyer_id != current_user_id():
        return jsonify({"error": "You can only update your own orders"}), 403
    data = request.get_json(silent=True) or {}

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
    if new_status in {"REJECTED", "CANCELLED"}:
        for item in order.order_items:
            if item.animal.status == "RESERVED":
                item.animal.status = "AVAILABLE"
    elif new_status == "COMPLETED":
        for item in order.order_items:
            item.animal.status = "SOLD"

    db.session.commit()

    return jsonify(
        response_schema.dump(order)
    ), 200
