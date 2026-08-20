from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.animal import Animal
from app.schemas.cart_schema import (
    CartResponseSchema
)

cart_bp = Blueprint(
    "carts",
    __name__,
    url_prefix="/api/carts"
)

cart_response_schema = CartResponseSchema()