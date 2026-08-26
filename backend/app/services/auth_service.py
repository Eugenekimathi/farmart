from app.extensions import db
from app.models.user import User
from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)


def register_user(
    full_name,
    email,
    phone,
    password,
    role="FARMER"
):

    existing = User.query.filter_by(
        email=email
    ).first()

    if existing:
        raise ValueError(
            "Email already registered"
        )

    user = User(
        full_name=full_name,
        email=email,
        phone=phone,
        password_hash=generate_password_hash(
            password
        ),
        role=role
    )

    db.session.add(user)
    db.session.commit()

    return user


def verify_password(user, password):

    return check_password_hash(
        user.password_hash,
        password
    )
