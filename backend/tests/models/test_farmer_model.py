def test_farmer_can_be_created(session, user):
    from app.models.farmer import Farmer

    farmer = Farmer(
        user_id=user.id,
        farm_name="Green Valley Farm",
        farm_location="Nairobi",
        description="Test farm"
    )

    session.add(farmer)
    session.commit()

    assert farmer.id is not None
    assert farmer.farm_name == "Green Valley Farm"
    assert farmer.user_id == user.id

def test_user_can_have_only_one_farmer(session, user):
    import pytest
    from sqlalchemy.exc import IntegrityError
    from app.models.farmer import Farmer

    farmer1 = Farmer(
        user_id=user.id,
        farm_name="Green Valley Farm",
        farm_location="Nairobi"
    )

    session.add(farmer1)
    session.commit()

    farmer2 = Farmer(
        user_id=user.id,
        farm_name="Second Farm",
        farm_location="Nakuru"
    )

    session.add(farmer2)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()    