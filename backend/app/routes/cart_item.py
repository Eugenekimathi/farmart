from flask import Blueprint, request, jsonify

from app.extensions import db
from app.authz import authenticated, current_user_id
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
    if cart.user_id != current_user_id():
        return jsonify({"error": "You can only access your own cart"}), 403
    try:
        raw = request.get_json(silent=True) or {}
        raw["cart_id"] = cart_id
        data = schema.load(raw)
    except Exception as error:
        return jsonify({"error": "Invalid cart item data", "details": getattr(error, "messages", str(error))}), 400

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

    response = response_schema.dump(item)
    response["message"] = "Animal added to cart"
    response["cart_item_id"] = item.id
    return jsonify(response), 201

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
    if cart.user_id != current_user_id():
        return jsonify({"error": "You can only access your own cart"}), 403
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

    cart = db.session.get(Cart, cart_id)
    if not cart:
        return jsonify({"error": "Cart not found"}), 404
    if cart.user_id != current_user_id():
        return jsonify({"error": "You can only access your own cart"}), 403
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

    cart = db.session.get(Cart, cart_id)
    if not cart:
        return jsonify({"error": "Cart not found"}), 404
    if cart.user_id != current_user_id():
        return jsonify({"error": "You can only access your own cart"}), 403
    item = CartItem.query.filter_by(
        id=item_id,
        cart_id=cart_id
    ).first()

    if not item:
        return jsonify({
            "error": "Cart item not found"
        }), 404

    try:
        raw = request.get_json(silent=True) or {}
        raw["cart_id"] = cart_id
        data = schema.load(raw)
    except Exception as error:
        return jsonify({"error": "Invalid cart item data", "details": getattr(error, "messages", str(error))}), 400

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

    duplicate = CartItem.query.filter_by(cart_id=cart_id, animal_id=animal.id).first()
    if duplicate and duplicate.id != item.id:
        return jsonify({"error": "Animal already exists in cart"}), 409

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

    cart = db.session.get(Cart, cart_id)
    if not cart:
        return jsonify({"error": "Cart not found"}), 404
    if cart.user_id != current_user_id():
        return jsonify({"error": "You can only access your own cart"}), 403
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
