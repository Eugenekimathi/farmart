from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models.user import User
from app.schemas.user_schema import (
    UserRegisterSchema,
    UserResponseSchema
)

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)

register_schema = UserRegisterSchema()
response_schema = UserResponseSchema()


@auth_bp.route("/register", methods=["POST"])
def register():

    data = register_schema.load(
        request.get_json()
    )

    existing_user = User.query.filter_by(
        email=data["email"]
    ).first()

    if existing_user:
        return jsonify({
            "error": "Email already exists"
        }), 409

    user = User(
        full_name=data["full_name"],
        email=data["email"],
        phone=data["phone"],
        password_hash=generate_password_hash(
            data["password"]
        ),
        role=data["role"],
        location=data.get("location")
    )

    db.session.add(user)
    db.session.commit()

    return jsonify(
        response_schema.dump(user)
    ), 201