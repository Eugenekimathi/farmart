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