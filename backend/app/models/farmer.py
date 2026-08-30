from app.extensions import db

class Farmer(db.Model):
    __tablename__ = "farmers"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    farm_name = db.Column(
        db.String(150),
        nullable=False
    )

    farm_location = db.Column(
        db.String(150),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    user = db.relationship(
        "User",
        back_populates="farmer"
    )

    animals = db.relationship(
        "Animal",
        back_populates="farmer",
        lazy=True,
        cascade="all, delete-orphan"
    )