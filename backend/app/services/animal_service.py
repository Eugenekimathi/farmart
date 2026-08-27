from app.extensions import db
from app.models.animals import Animal


def get_animal(animal_id):
    return db.session.get(Animal, animal_id)


def ensure_animal_available(animal_id):
    animal = get_animal(animal_id)

    if not animal:
        raise ValueError("Animal not found")

    if animal.status != "AVAILABLE":
        raise ValueError("Animal is not available")

    return animal


def mark_animal_sold(animal):
    animal.status = "SOLD"
    db.session.commit()

    return animal
