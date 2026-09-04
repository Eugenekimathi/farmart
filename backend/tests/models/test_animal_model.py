import pytest
from sqlalchemy.exc import IntegrityError


def test_animal_can_be_created(session, animal):
    assert animal.id is not None
    assert animal.name == "Cow 001"
    assert animal.price == 100000
    assert animal.status == "AVAILABLE"


def test_animal_requires_farmer(session, animal_type, breed):
    from app.models.animals import Animal

    animal = Animal(
        animal_type_id=animal_type.id,
        breed_id=breed.id,
        name="Cow 002",
        gender="MALE",
        age=2,
        price=80000,
        location="Nairobi"
    )

    session.add(animal)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()