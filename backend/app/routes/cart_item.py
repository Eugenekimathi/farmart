from flask import Blueprint, request, jsonify

from app.extensions import db
from app.authz import authenticated
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.animals import Animal
from app.schemas.cart_item_schema import (
    CartItemSchema,
    CartItemResponseSchema
)

cart_item_bp = Blueprint(
    "cart_items",
    __name__,
    url_prefix="/api/carts"
)

schema = CartItemSchema()
response_schema = CartItemResponseSchema()
many_schema = CartItemResponseSchema(many=True)

@cart_item_bp.route(
    "/<int:cart_id>/items",
    methods=["POST"]
)
@authenticated
def add_cart_item(cart_id):

    cart = db.session.get(Cart, cart_id)

    if not cart:
        return jsonify({
            "error": "Cart not found"
        }), 404

    data = schema.load(request.get_json())

    animal = db.session.get(
        Animal,
        data["animal_id"]
    )

    if not animal:
        return jsonify({
            "error": "Animal not found"
        }), 404

    if animal.status != "AVAILABLE":
        return jsonify({
            "error": "Animal is not available"
        }), 400

    existing_item = CartItem.query.filter_by(
        cart_id=cart_id,
        animal_id=data["animal_id"]
    ).first()

    if existing_item:
        return jsonify({
            "error": "Animal already exists in cart"
        }), 409

    item = CartItem(
        cart_id=cart_id,
        animal_id=data["animal_id"]
    )

    db.session.add(item)
    db.session.commit()

    return jsonify(
        response_schema.dump(item)
    ), 201

@cart_item_bp.route(
    "/<int:cart_id>/items",
    methods=["GET"]
)
@authenticated
def get_cart_items(cart_id):

    cart = db.session.get(Cart, cart_id)

    if not cart:
        return jsonify({
            "error": "Cart not found"
        }), 404

    items = CartItem.query.filter_by(
        cart_id=cart_id
    ).all()

    return jsonify(
        many_schema.dump(items)
    ), 200

@cart_item_bp.route(
    "/<int:cart_id>/items/<int:item_id>",
    methods=["GET"]
)
@authenticated
def get_cart_item(cart_id, item_id):

    item = CartItem.query.filter_by(
        id=item_id,
        cart_id=cart_id
    ).first()

    if not item:
        return jsonify({
            "error": "Cart item not found"
        }), 404

    return jsonify(
        response_schema.dump(item)
    ), 200

@cart_item_bp.route(
    "/<int:cart_id>/items/<int:item_id>",
    methods=["PUT"]
)
@authenticated
def update_cart_item(cart_id, item_id):

    item = CartItem.query.filter_by(
        id=item_id,
        cart_id=cart_id
    ).first()

    if not item:
        return jsonify({
            "error": "Cart item not found"
        }), 404

    data = schema.load(request.get_json())

    animal = db.session.get(
        Animal,
        data["animal_id"]
    )

    if not animal:
        return jsonify({
            "error": "Animal not found"
        }), 404

    if animal.status != "AVAILABLE":
        return jsonify({
            "error": "Animal is not available"
        }), 400

    item.animal_id = data["animal_id"]

    db.session.commit()

    return jsonify(
        response_schema.dump(item)
    ), 200

@cart_item_bp.route(
    "/<int:cart_id>/items/<int:item_id>",
    methods=["DELETE"]
)
@authenticated
def delete_cart_item(cart_id, item_id):

    item = CartItem.query.filter_by(
        id=item_id,
        cart_id=cart_id
    ).first()

    if not item:
        return jsonify({
            "error": "Cart item not found"
        }), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({
        "message": "Cart item removed successfully"
    }), 200