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

    animals = db.relationship(
        "Animal",
        backref="breed",
        lazy=True
    )