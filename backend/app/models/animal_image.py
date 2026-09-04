from app.extensions import db


class AnimalImage(db.Model):
    __tablename__ = "animal_images"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    animal_id = db.Column(
        db.Integer,
        db.ForeignKey("animals.id"),
        nullable=False
    )

    image_url = db.Column(
        db.String(500),
        nullable=False
    )

    is_primary = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    animal = db.relationship(
        "Animal",
        backref=db.backref(
            "images",
            lazy=True,
            cascade="all, delete-orphan"
        )
    )