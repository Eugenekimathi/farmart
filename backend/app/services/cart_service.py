from app.extensions import db
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.services.animal_service import ensure_animal_available


def get_cart(cart_id):
    cart = db.session.get(Cart, cart_id)

    if not cart:
        raise ValueError("Cart not found")

    return cart


def add_item(cart_id, animal_id):
    cart = get_cart(cart_id)

    animal = ensure_animal_available(animal_id)

    existing = CartItem.query.filter_by(
        cart_id=cart.id,
        animal_id=animal.id
    ).first()

    if existing:
        raise ValueError(
            "Animal already exists in cart"
        )

    item = CartItem(
        cart_id=cart.id,
        animal_id=animal.id
    )

    db.session.add(item)
    db.session.commit()

    return item


def remove_item(cart_id, item_id):
    item = CartItem.query.filter_by(
        id=item_id,
        cart_id=cart_id
    ).first()

    if not item:
        raise ValueError("Cart item not found")

    db.session.delete(item)
    db.session.commit()
