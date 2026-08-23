def test_animal_type_can_be_created(session):
    from app.models.animal_type import AnimalType

    animal_type = AnimalType(
        name="Cattle",
        description="Cattle for testing"
    )

    session.add(animal_type)
    session.commit()

    assert animal_type.id is not None
    assert animal_type.name == "Cattle"


def test_duplicate_animal_type_name_is_rejected(session):
    import pytest
    from sqlalchemy.exc import IntegrityError
    from app.models.animal_type import AnimalType

    animal_type1 = AnimalType(name="Cattle")
    animal_type2 = AnimalType(name="Cattle")

    session.add(animal_type1)
    session.commit()

    session.add(animal_type2)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()