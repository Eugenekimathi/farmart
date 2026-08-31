from flask import Blueprint, request, jsonify

from app.extensions import db
from app.authz import authenticated, current_user_id, current_farmer
from app.models.animals import Animal
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order_item_schema import (
    OrderItemSchema,
    OrderItemResponseSchema
)

order_item_bp = Blueprint(
    "order_items",
    __name__,
    url_prefix="/api/orders"
)

schema = OrderItemSchema()
response_schema = OrderItemResponseSchema()
many_schema = OrderItemResponseSchema(many=True)


def can_access_order(order):
    if order.buyer_id == current_user_id():
        return True
    farmer = current_farmer()
    return bool(farmer and any(item.farmer_id == farmer.id for item in order.order_items))

@order_item_bp.route(
    "/<int:order_id>/items",
    methods=["POST"]
)
@authenticated
def create_order_item(order_id):

    order = db.session.get(Order, order_id)

    if not order:
        return jsonify({
            "error": "Order not found"
        }), 404
    if order.buyer_id != current_user_id():
        return jsonify({"error": "You can only modify your own orders"}), 403
    if order.status != "PENDING":
        return jsonify({"error": "Order items can only be changed while an order is pending"}), 409

    try:
        data = schema.load(request.get_json(silent=True) or {})
    except Exception as error:
        return jsonify({"error": "Invalid order item data", "details": getattr(error, "messages", str(error))}), 400
    animal = db.session.get(Animal, data["animal_id"])
    if not animal or animal.status != "AVAILABLE":
        return jsonify({"error": "Animal is not available"}), 400
    if data["farmer_id"] != animal.farmer_id or data["price"] != animal.price:
        return jsonify({"error": "Order item must match the current animal listing"}), 400

    data["order_id"] = order_id

    item = OrderItem(**data)

    db.session.add(item)
    animal.status = "RESERVED"
    order.total_amount += item.price * item.quantity
    db.session.commit()

    return jsonify(
        response_schema.dump(item)
    ), 201

@order_item_bp.route(
    "/<int:order_id>/items",
    methods=["GET"]
)
@authenticated
def get_order_items(order_id):

    order = db.session.get(Order, order_id)

    if not order:
        return jsonify({
            "error": "Order not found"
        }), 404
    if not can_access_order(order):
        return jsonify({"error": "You can only view your own order items"}), 403

    items = OrderItem.query.filter_by(
        order_id=order_id
    ).all()

    return jsonify(
        many_schema.dump(items)
    ), 200

@order_item_bp.route(
    "/<int:order_id>/items/<int:item_id>",
    methods=["GET"]
)
@authenticated
def get_order_item(order_id, item_id):

    item = OrderItem.query.filter_by(
        id=item_id,
        order_id=order_id
    ).first()

    if not item:
        return jsonify({
            "error": "Order item not found"
        }), 404
    if not can_access_order(item.order):
        return jsonify({"error": "You can only view your own order items"}), 403

    return jsonify(
        response_schema.dump(item)
    ), 200

@order_item_bp.route(
    "/<int:order_id>/items/<int:item_id>",
    methods=["PUT"]
)
@authenticated
def update_order_item(order_id, item_id):

    item = OrderItem.query.filter_by(
        id=item_id,
        order_id=order_id
    ).first()

    if not item:
        return jsonify({
            "error": "Order item not found"
        }), 404
    if item.order.buyer_id != current_user_id():
        return jsonify({"error": "You can only modify your own order items"}), 403

    if item.order.status != "PENDING":
        return jsonify({
            "error": "Order items cannot be changed after order confirmation"
        }), 400

    try:
        data = schema.load(request.get_json(silent=True) or {})
    except Exception as error:
        return jsonify({"error": "Invalid order item data", "details": getattr(error, "messages", str(error))}), 400
    animal = db.session.get(Animal, data["animal_id"])
    if not animal or animal.status not in {"AVAILABLE", "RESERVED"}:
        return jsonify({"error": "Animal is not available"}), 400
    if data["farmer_id"] != animal.farmer_id or data["price"] != animal.price:
        return jsonify({"error": "Order item must match the current animal listing"}), 400

    data["order_id"] = order_id

    item.order.total_amount -= item.price * item.quantity
    for key, value in data.items():
        setattr(item, key, value)
    item.order.total_amount += item.price * item.quantity

    db.session.commit()

    return jsonify(
        response_schema.dump(item)
    ), 200

@order_item_bp.route(
    "/<int:order_id>/items/<int:item_id>",
    methods=["DELETE"]
)
@authenticated
def delete_order_item(order_id, item_id):

    item = OrderItem.query.filter_by(
        id=item_id,
        order_id=order_id
    ).first()

    if not item:
        return jsonify({
            "error": "Order item not found"
        }), 404
    if item.order.buyer_id != current_user_id():
        return jsonify({"error": "You can only modify your own order items"}), 403

    if item.order.status != "PENDING":
        return jsonify({
            "error": "Order items cannot be deleted after order confirmation"
        }), 400

    item.animal.status = "AVAILABLE"
    item.order.total_amount -= item.price * item.quantity
    db.session.delete(item)
    db.session.commit()

    return jsonify({
        "message": "Order item deleted successfully"
    }), 200


