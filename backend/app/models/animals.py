from app.extensions import db

class Animal(db.Model):
    __tablename__ = "animals"

    id = db.Column(db.Integer, primary_key=True)

    farmer_id = db.Column(
        db.Integer,
        db.ForeignKey("farmers.id"),
        nullable=False
    )

    animal_type_id = db.Column(
        db.Integer,
        db.ForeignKey("animal_types.id"),
        nullable=False
    )

    breed_id = db.Column(
        db.Integer,
        db.ForeignKey("breeds.id"),
        nullable=False
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    gender = db.Column(
        db.String(20),
        nullable=False
    )

    age = db.Column(
        db.Integer,
        nullable=False
    )

    price = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    location = db.Column(
        db.String(150),
        nullable=False
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="AVAILABLE"
    )