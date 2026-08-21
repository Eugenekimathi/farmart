from app.extensions import db

class CartItem(db.Model):
    __tablename__ = "cart_items"

    id = db.Column(db.Integer, primary_key=True)

    cart_id = db.Column(
        db.Integer,
        db.ForeignKey("carts.id"),
        nullable=False
    )

    animal_id = db.Column(
        db.Integer,
        db.ForeignKey("animals.id"),
        nullable=False
    )

    __table_args__ = (
        db.UniqueConstraint(
            "cart_id",
            "animal_id",
            name="unique_cart_animal"
        ),
    )