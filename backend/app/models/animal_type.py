from app.extensions import db

class AnimalType(db.Model):
    __tablename__ = "animal_types"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    breeds = db.relationship(
        "Breed",
        back_populates="animal_type",
        lazy=True
    )

    animals = db.relationship(
        "Animal",
        back_populates="animal_type",
        lazy=True
    )
    