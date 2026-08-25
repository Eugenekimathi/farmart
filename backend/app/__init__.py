import os
from flask_migrate import Migrate
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from app.extensions import db
load_dotenv()

def create_app(config=None):

    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    if config:
        app.config.update(config)
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-change-me")
    JWTManager(app)

    # Allow the Vite React frontend to call the API
    frontend_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    CORS(app, resources={r"/api/*": {"origins": frontend_origins}}, supports_credentials=True)

    if config:
        app.config.update(config)

    db.init_app(app)
    migrate = Migrate(app, db)

    from app import models

    from app.routes.auth import auth_bp
    from app.routes.farmers import farmer_bp
    from app.routes.animal_type import animal_type_bp
    from app.routes.breed import breed_bp
    from app.routes.animals import animal_bp
    from app.routes.animal_image import animal_image_bp
    from app.routes.cart import cart_bp
    from app.routes.cart_item import cart_item_bp
    from app.routes.orders import order_bp
    from app.routes.order_item import order_item_bp
    from app.routes.payments import payment_bp
    from app.routes.delivery import delivery_bp


    app.register_blueprint(auth_bp)
    app.register_blueprint(farmer_bp)
    app.register_blueprint(animal_type_bp)
    app.register_blueprint(breed_bp)
    app.register_blueprint(animal_bp)
    app.register_blueprint(animal_image_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(cart_item_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(order_item_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(delivery_bp)

    return app