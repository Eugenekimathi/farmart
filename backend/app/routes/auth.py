import os
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
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


def _auth_payload(user):
    # Build the { user, token } response the React frontend expects
    user_data = response_schema.dump(user)
    # Frontend compares roles in lowercase ('farmer' / 'buyer')
    user_data["role"] = (user.role or "").lower()
    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user_data["role"], "email": user.email}
    )
    return jsonify({"user": user_data, "token": token}), 200


@auth_bp.route("/register", methods=["POST"])
def register():
    payload = request.get_json(silent=True) or {}
    # The API stores roles as uppercase; accept either frontend casing.
    if isinstance(payload.get("role"), str):
        payload["role"] = payload["role"].upper()
    try:
        data = register_schema.load(payload)
    except ValidationError as error:
        return jsonify({"message": "Invalid registration data", "errors": error.messages}), 400

    existing_user = User.query.filter(
        db.func.lower(User.email) == data["email"].lower()
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
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"message": "Email or phone number already exists"}), 409
    # Auto-login after registration: return { user, token }
    body, status = _auth_payload(user)
    return body, 201
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({
            "message": "Email and password are required"
        }), 400
    user = User.query.filter(
        db.func.lower(User.email) == email
    ).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({
            "message": "Invalid email or password"
        }), 401
    return _auth_payload(user)
