from app.extensions import db

class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)

    order_id = db.Column(
        db.Integer,
        db.ForeignKey("orders.id"),
        nullable=False
    )

    animal_id = db.Column(
        db.Integer,
        db.ForeignKey("animals.id"),
        nullable=False
    )

    farmer_id = db.Column(
        db.Integer,
        db.ForeignKey("farmers.id"),
        nullable=False
    )

    price = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    quantity = db.Column(
        db.Integer,
        nullable=False,
        default=1
    )

    # Relationships
    order = db.relationship(
        "Order",
        back_populates="order_items"
    )

    animal = db.relationship(
        "Animal",
        backref=db.backref("order_items", lazy=True)
    )

    farmer = db.relationship(
        "Farmer",
        backref=db.backref("order_items", lazy=True)
    )