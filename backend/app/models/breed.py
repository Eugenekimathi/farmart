from app.extensions import db

class Breed(db.Model):
    __tablename__ = "breeds"

    id = db.Column(db.Integer, primary_key=True)

    animal_type_id = db.Column(
        db.Integer,
        db.ForeignKey("animal_types.id"),
        nullable=False
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    animal_type = db.relationship(
        "AnimalType",
        back_populates="breeds"
    )

    animals = db.relationship(
        "Animal",
        back_populates="breed",
        lazy=True
    )