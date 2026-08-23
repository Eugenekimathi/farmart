import pytest
from sqlalchemy.exc import IntegrityError

def test_user_can_be_created(session):
    from app.models.user import User

    user = User(
        full_name="John Doe",
        email="john@test.com",
        phone="0712345678",
        password_hash="hashed-password",
        role="USER"
    )

    session.add(user)
    session.commit()

    assert user.id is not None
    assert user.email == "john@test.com"

def test_duplicate_email_is_rejected(session):
    from app.models.user import User

    user1 = User(
        full_name="John",
        email="john@test.com",
        phone="0711111111",
        password_hash="hash",
        role="USER"
    )

    user2 = User(
        full_name="Jane",
        email="john@test.com",  # duplicate email
        phone="0722222222",
        password_hash="hash",
        role="USER"
    )

    session.add(user1)
    session.commit()

    session.add(user2)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()


def test_duplicate_phone_is_rejected(session):
    from app.models.user import User

    user1 = User(
        full_name="John",
        email="john1@test.com",
        phone="0711111111",
        password_hash="hash",
        role="USER"
    )

    user2 = User(
        full_name="Jane",
        email="jane@test.com",
        phone="0711111111",  # duplicate phone
        password_hash="hash",
        role="USER"
    )

    session.add(user1)
    session.commit()

    session.add(user2)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()
