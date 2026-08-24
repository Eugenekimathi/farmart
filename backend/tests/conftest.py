import pytest

from app import create_app
from app.extensions import db


@pytest.fixture
def app():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
    })

    with app.app_context():
        db.create_all()

        yield app

        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


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