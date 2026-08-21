from flask import Flask
from app.extensions import db


def create_app():

    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        "sqlite:///farmmart.db"
    )

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    from app.routes.auth_routes import auth_bp
    from app.routes.farmer_routes import farmer_bp
    from app.routes.animal_type_routes import animal_type_bp
    from app.routes.breed_routes import breed_bp
    from app.routes.animal_routes import animal_bp
    from app.routes.animal_image_routes import animal_image_bp
    from app.routes.cart_routes import cart_bp
    from app.routes.order_routes import order_bp
    from app.routes.payment_routes import payment_bp
    from app.routes.delivery_routes import delivery_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(farmer_bp)
    app.register_blueprint(animal_type_bp)
    app.register_blueprint(breed_bp)
    app.register_blueprint(animal_bp)
    app.register_blueprint(animal_image_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(delivery_bp)

    return app