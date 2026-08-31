from flask import Blueprint, request, jsonify

from app.extensions import db
from app.authz import authenticated, current_user_id
from app.models.cart import Cart
from app.schemas.cart_schema import (
    CartResponseSchema
)


cart_bp = Blueprint(
    "carts",
    __name__,
    url_prefix="/api/carts"
)


cart_response_schema = CartResponseSchema()


@cart_bp.route("", methods=["POST"])
@authenticated
def create_cart():

    data = request.get_json() or {}

    user_id = data.get("user_id")

    if not user_id:
        return jsonify({
            "error": "user_id is required"
        }), 400
    if int(user_id) != current_user_id():
        return jsonify({"error": "You can only access your own cart"}), 403

    existing_cart = Cart.query.filter_by(
        user_id=user_id
    ).first()

    if existing_cart:
        return jsonify(
            cart_response_schema.dump(existing_cart)
        ), 200

    cart = Cart(
        user_id=user_id
    )

    db.session.add(cart)
    db.session.commit()

    return jsonify(
        cart_response_schema.dump(cart)
    ), 201


@cart_bp.route(
    "/<int:cart_id>",
    methods=["GET"]
)
@authenticated
def get_cart(cart_id):

    cart = db.session.get(
        Cart,
        cart_id
    )

    if not cart:
        return jsonify({
            "error": "Cart not found"
        }), 404
    if cart.user_id != current_user_id():
        return jsonify({"error": "You can only access your own cart"}), 403
    return jsonify(
        cart_response_schema.dump(cart)
    ), 200

