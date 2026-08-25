import pytest
from sqlalchemy.exc import IntegrityError


def test_payment_can_be_created(session, payment):
    assert payment.id is not None
    assert payment.order_id is not None
    assert payment.amount == 100000
    assert payment.payment_method == "MPESA"
    assert payment.status == "PENDING"


def test_order_can_have_only_one_payment(session, order):
    from app.models.payment import Payment

    payment1 = Payment(
        order_id=order.id,
        amount=100000,
        payment_method="MPESA",
        transaction_reference="TXN-001",
        status="PENDING"
    )

    session.add(payment1)
    session.commit()

    payment2 = Payment(
        order_id=order.id,
        amount=100000,
        payment_method="MPESA",
        transaction_reference="TXN-002",
        status="PENDING"
    )

    session.add(payment2)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()


def test_transaction_reference_must_be_unique(session, order):
    from app.models.payment import Payment

    payment1 = Payment(
        order_id=order.id,
        amount=100000,
        payment_method="MPESA",
        transaction_reference="SAME-REF",
        status="PENDING"
    )

    session.add(payment1)
    session.commit()

    # Need another order because order_id is also unique.
    from app.models.order import Order

    order2 = Order(
        buyer_id=order.buyer_id,
        total_amount=50000,
        status="PENDING",
        delivery_address="Nairobi",
        delivery_phone="0722222222"
    )

    session.add(order2)
    session.commit()

    payment2 = Payment(
        order_id=order2.id,
        amount=50000,
        payment_method="MPESA",
        transaction_reference="SAME-REF",
        status="PENDING"
    )

    session.add(payment2)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()