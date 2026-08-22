import os
from flask_migrate import Migrate
from flask import Flask
from dotenv import load_dotenv

from app.extensions import db

load_dotenv()

def create_app():

    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL") 
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

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