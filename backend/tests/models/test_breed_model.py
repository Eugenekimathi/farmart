def test_breed_can_be_created(session, animal_type):
    from app.models.breed import Breed

    breed = Breed(
        animal_type_id=animal_type.id,
        name="Friesian",
        description="Friesian cattle breed"
    )

    session.add(breed)
    session.commit()

    assert breed.id is not None
    assert breed.name == "Friesian"
    assert breed.animal_type_id == animal_type.id