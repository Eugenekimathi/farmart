import pytest
from app.extensions import db
from app.models.transaction import Transaction
from app.models.order import Order
from app.models.payment import Payment


def _valid_callback(checkout_request_id, result_code=0, result_desc="The service request is processed successfully."):
    return {
        "Body": {
            "stkCallback": {
                "MerchantRequestID": "MRID-12345",
                "CheckoutRequestID": checkout_request_id,
                "ResultCode": result_code,
                "ResultDesc": result_desc,
                "CallbackMetadata": {
                    "Item": [
                        {"Name": "Amount", "Value": 1000.0},
                        {"Name": "MpesaReceiptNumber", "Value": "RPT1234567"},
                        {"Name": "TransactionDate", "Value": "20260902120000"},
                        {"Name": "PhoneNumber", "Value": 254712345678},
                    ]
                },
            }
        }
    }


@pytest.fixture
def buyer(session):
    from app.models.user import User
    user = User(
        full_name="M-Pesa Buyer",
        email="mpesa-buyer@test.com",
        phone="0712345678",
        password_hash="hashed-password",
        role="BUYER",
        location="Nairobi",
    )
    session.add(user)
    session.commit()
    return user


@pytest.fixture
def buyer_order(session, buyer):
    order = Order(
        buyer_id=buyer.id,
        total_amount=1000.0,
        status="PENDING",
        delivery_address="Nairobi",
        delivery_phone="0712345678",
    )
    session.add(order)
    session.commit()
    return order


@pytest.fixture
def pending_transaction(session, buyer_order):
    transaction = Transaction(
        order_id=buyer_order.id,
        checkout_request_id="WS_CO_19092025120000000",
        merchant_request_id="MRID-12345",
        phone_number="254712345678",
        amount=1000.0,
        status="PENDING",
    )
    session.add(transaction)
    session.commit()
    return transaction


def test_callback_success_updates_transaction(app, client, pending_transaction):
    """A successful callback should mark the transaction SUCCESS."""
    checkout_id = pending_transaction.checkout_request_id
    response = client.post(
        "/api/payments/callback",
        json=_valid_callback(checkout_id),
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["ResultCode"] == 0
    assert data["transaction"]["status"] == "SUCCESS"
    assert data["transaction"]["receipt_number"] == "RPT1234567"
    assert data["transaction"]["result_code"] == "0"


def test_callback_is_idempotent(app, client, pending_transaction):
    """Duplicate callbacks must not duplicate transactions or payments."""
    checkout_id = pending_transaction.checkout_request_id

    first = client.post("/api/payments/callback", json=_valid_callback(checkout_id))
    second = client.post("/api/payments/callback", json=_valid_callback(checkout_id))

    assert first.status_code == 200
    assert second.status_code == 200

    with app.app_context():
        transactions = Transaction.query.filter_by(
            checkout_request_id=checkout_id
        ).all()
        assert len(transactions) == 1

        # Only one payment row should exist for the order.
        order = db.session.get(Order, pending_transaction.order_id)
        payments = Payment.query.filter_by(order_id=order.id).all()
        assert len(payments) == 1
        assert payments[0].status == "SUCCESS"
        assert payments[0].transaction_reference == "RPT1234567"

        # Order should be confirmed.
        assert order.status == "CONFIRMED"


def test_callback_failed_result_code(app, client, pending_transaction):
    """A failed callback should mark the transaction FAILED."""
    checkout_id = pending_transaction.checkout_request_id
    response = client.post(
        "/api/payments/callback",
        json=_valid_callback(checkout_id, result_code=1, result_desc="The balance is insufficient."),
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["transaction"]["status"] == "FAILED"
    assert data["transaction"]["result_code"] == "1"


def test_callback_cancelled_result_code(app, client, pending_transaction):
    """ResultCode 1032 maps to CANCELLED."""
    checkout_id = pending_transaction.checkout_request_id
    response = client.post(
        "/api/payments/callback",
        json=_valid_callback(checkout_id, result_code=1032, result_desc="Request cancelled by user."),
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["transaction"]["status"] == "CANCELLED"


def test_callback_unknown_checkout_request_id(app, client):
    """Callbacks for unknown CheckoutRequestID should not create transactions."""
    response = client.post(
        "/api/payments/callback",
        json=_valid_callback("UNKNOWN_ID_12345"),
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["ResultCode"] == 1

    with app.app_context():
        assert Transaction.query.filter_by(
            checkout_request_id="UNKNOWN_ID_12345"
        ).count() == 0


def test_callback_missing_body(app, client):
    """Callbacks without a Body should be rejected."""
    response = client.post("/api/payments/callback", json={})
    assert response.status_code == 400


def test_stk_push_persists_transaction(app, buyer_client, buyer_order):
    """STK Push initiation should persist a transaction when CheckoutRequestID is returned."""
    # Mock the M-Pesa service to avoid real API calls.
    from app.services import mpesa_service as mpesa_module
    original_initiate = mpesa_module.mpesa_service.initiate_stk_push

    def fake_initiate(phone_number, amount, account_reference, transaction_desc):
        return {
            "success": True,
            "data": {
                "CheckoutRequestID": "WS_CO_FAKE_123456789",
                "MerchantRequestID": "MRID-FAKE-1",
            },
            "message": "STK Push initiated successfully",
        }

    mpesa_module.mpesa_service.initiate_stk_push = fake_initiate
    try:
        response = buyer_client.post(
            "/api/payments/stkpush",
            json={
                "order_id": buyer_order.id,
                "phone_number": "0712345678",
            },
        )
    finally:
        mpesa_module.mpesa_service.initiate_stk_push = original_initiate

    assert response.status_code == 200
    data = response.get_json()
    assert data["checkout_request_id"] == "WS_CO_FAKE_123456789"

    with app.app_context():
        transaction = Transaction.query.filter_by(
            checkout_request_id="WS_CO_FAKE_123456789"
        ).first()
        assert transaction is not None
        assert transaction.status == "PENDING"
        assert transaction.order_id == buyer_order.id
        assert transaction.phone_number == "254712345678"


def test_transaction_status_endpoint_requires_auth(app, buyer_client, pending_transaction):
    """The status endpoint must require authentication."""
    response = buyer_client.get(
        f"/api/payments/status/{pending_transaction.checkout_request_id}"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["checkout_request_id"] == pending_transaction.checkout_request_id
    assert data["status"] == "PENDING"


def test_transaction_status_endpoint_unauthorized(app, pending_transaction, session):
    """A different buyer must not see another buyer's transaction."""
    from app.models.user import User
    other = User(
        full_name="Other Buyer",
        email="other-buyer@test.com",
        phone="0799999999",
        password_hash="hashed-password",
        role="BUYER",
        location="Nairobi",
    )
    session.add(other)
    session.commit()
    other_id = other.id
    other_email = other.email

    from flask_jwt_extended import create_access_token
    with app.app_context():
        token = create_access_token(
            identity=str(other_id),
            additional_claims={"role": "buyer", "email": other_email},
        )

    test_client = app.test_client()
    response = test_client.get(
        f"/api/payments/status/{pending_transaction.checkout_request_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403