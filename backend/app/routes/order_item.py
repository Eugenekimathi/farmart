from flask import Blueprint, request, jsonify

from app.extensions import db
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

@order_item_bp.route(
    "/<int:order_id>/items",
    methods=["POST"]
)
def create_order_item(order_id):

    order = db.session.get(Order, order_id)

    if not order:
        return jsonify({
            "error": "Order not found"
        }), 404

    data = schema.load(request.get_json())

    data["order_id"] = order_id

    item = OrderItem(**data)

    db.session.add(item)
    db.session.commit()

    return jsonify(
        response_schema.dump(item)
    ), 201

@order_item_bp.route(
    "/<int:order_id>/items",
    methods=["GET"]
)
def get_order_items(order_id):

    order = db.session.get(Order, order_id)

    if not order:
        return jsonify({
            "error": "Order not found"
        }), 404

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
def get_order_item(order_id, item_id):

    item = OrderItem.query.filter_by(
        id=item_id,
        order_id=order_id
    ).first()

    if not item:
        return jsonify({
            "error": "Order item not found"
        }), 404

    return jsonify(
        response_schema.dump(item)
    ), 200

@order_item_bp.route(
    "/<int:order_id>/items/<int:item_id>",
    methods=["PUT"]
)
def update_order_item(order_id, item_id):

    item = OrderItem.query.filter_by(
        id=item_id,
        order_id=order_id
    ).first()

    if not item:
        return jsonify({
            "error": "Order item not found"
        }), 404

    data = schema.load(request.get_json())

    data["order_id"] = order_id

    for key, value in data.items():
        setattr(item, key, value)

    db.session.commit()

    return jsonify(
        response_schema.dump(item)
    ), 200

@order_item_bp.route(
    "/<int:order_id>/items/<int:item_id>",
    methods=["DELETE"]
)
def delete_order_item(order_id, item_id):

    item = OrderItem.query.filter_by(
        id=item_id,
        order_id=order_id
    ).first()

    if not item:
        return jsonify({
            "error": "Order item not found"
        }), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({
        "message": "Order item deleted successfully"
    }), 200



