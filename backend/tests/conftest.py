import pytest

from app import create_app
from app.extensions import db


@pytest.fixture
def app():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        "JWT_SECRET_KEY": "test-secret-key-that-is-long-enough",
    })

    with app.app_context():
        db.create_all()

        yield app

        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    from flask_jwt_extended import create_access_token
    with app.app_context():
        token = create_access_token(
            identity="1",
            additional_claims={"role": "FARMER", "email": "test@example.com"}
        )

    test_client = app.test_client()
    original_open = test_client.open
    def open_with_auth(*args, **kwargs):
        headers = kwargs.setdefault("headers", {})
        headers.setdefault("Authorization", f"Bearer {token}")
        return original_open(*args, **kwargs)

    test_client.open = open_with_auth
    return test_client


@pytest.fixture
def session(app):
    with app.app_context():
        yield db.session


@pytest.fixture
def user(session):
    from app.models.user import User

    user = User(
        full_name="John Buyer",
        email="buyer@test.com",
        phone="0712345678",
        password_hash="hashed-password",
        role="USER",
        location="Nairobi"
    )

    session.add(user)
    session.commit()

    return user

@pytest.fixture
def farmer(session, user):
    from app.models.farmer import Farmer

    farmer = Farmer(
        user_id=user.id,
        farm_name="Test Farm",
        farm_location="Nairobi",
        description="Test farm for pytest"
    )

    session.add(farmer)
    session.commit()

    return farmer

@pytest.fixture
def animal_type(session):
    from app.models.animal_type import AnimalType

    animal_type = AnimalType(
        name="Cattle",
        description="Cattle animals for testing"
    )

    session.add(animal_type)
    session.commit()

    return animal_type

@pytest.fixture
def breed(session, animal_type):
    from app.models.breed import Breed

    breed = Breed(
        animal_type_id=animal_type.id,
        name="Friesian",
        description="Friesian cattle breed for testing"
    )

    session.add(breed)
    session.commit()

    return breed

@pytest.fixture
def animal(session, farmer, animal_type, breed):
    from app.models.animals import Animal

    animal = Animal(
        farmer_id=farmer.id,
        animal_type_id=animal_type.id,
        breed_id=breed.id,
        name="Cow 001",
        gender="FEMALE",
        age=3,
        price=100000,
        description="Test Friesian cow",
        location="Nairobi",
        status="AVAILABLE"
    )

    session.add(animal)
    session.commit()

    return animal

@pytest.fixture
def cart(session, user):
    from app.models.cart import Cart

    cart = Cart(
        user_id=user.id
    )

    session.add(cart)
    session.commit()

    return cart

@pytest.fixture
def cart_item(session, cart, animal):
    from app.models.cart_item import CartItem

    cart_item = CartItem(
        cart_id=cart.id,
        animal_id=animal.id
    )

    session.add(cart_item)
    session.commit()

    return cart_item

@pytest.fixture
def order(session, user):
    from app.models.order import Order

    order = Order(
        buyer_id=user.id,
        total_amount=100000,
        status="PENDING",
        delivery_address="Nairobi",
        delivery_phone="0712345678"
    )

    session.add(order)
    session.commit()

    return order

@pytest.fixture
def order_item(session, order, animal, farmer):
    from app.models.order_item import OrderItem

    order_item = OrderItem(
        order_id=order.id,
        animal_id=animal.id,
        farmer_id=farmer.id,
        price=100000,
        quantity=1
    )

    session.add(order_item)
    session.commit()

    return order_item

@pytest.fixture
def payment(session, order):
    from app.models.payment import Payment

    payment = Payment(
        order_id=order.id,
        amount=100000,
        payment_method="MPESA",
        transaction_reference="TEST-TXN-001",
        status="PENDING"
    )

    session.add(payment)
    session.commit()

    return payment

@pytest.fixture
def delivery(session, order):
    from app.models.delivery import Delivery

    delivery = Delivery(
        order_id=order.id,
        delivery_address="Nairobi",
        delivery_phone="0712345678",
        status="PENDING",
        tracking_reference="TRACK-001"
    )

    session.add(delivery)
    session.commit()

    return delivery