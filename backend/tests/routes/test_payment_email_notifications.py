import pytest

from app.models.transaction import Transaction


def _successful_callback(checkout_request_id):
    return {
        "Body": {
            "stkCallback": {
                "MerchantRequestID": "MRID-EMAIL-1",
                "CheckoutRequestID": checkout_request_id,
                "ResultCode": 0,
                "ResultDesc": "The service request is processed successfully.",
                "CallbackMetadata": {
                    "Item": [
                        {"Name": "Amount", "Value": 1000.0},
                        {"Name": "MpesaReceiptNumber", "Value": "EMAIL12345"},
                        {"Name": "TransactionDate", "Value": "20260902120000"},
                        {"Name": "PhoneNumber", "Value": 254712345678},
                    ]
                },
            }
        }
    }


@pytest.fixture
def pending_transaction(session, order):
    transaction = Transaction(
        order_id=order.id,
        checkout_request_id="WS_CO_EMAIL_123456789",
        merchant_request_id="MRID-EMAIL-1",
        phone_number="254712345678",
        amount=1000.0,
        status="PENDING",
    )
    session.add(transaction)
    session.commit()
    return transaction


def test_successful_payment_notifies_buyer_and_farmer(
    app, client, pending_transaction, monkeypatch
):
    """A completed payment sends one receipt to the buyer and each farmer."""
    sent_messages = []
    app.config.update({"MAIL_USERNAME": "mailer@example.com", "MAIL_PASSWORD": "app-password"})
    monkeypatch.setattr(
        "app.email_utils.mail.send",
        lambda message: sent_messages.append(message),
    )

    response = client.post(
        "/api/payments/callback",
        json=_successful_callback(pending_transaction.checkout_request_id),
    )

    assert response.status_code == 200
    assert len(sent_messages) == 2
    assert all(message.recipients == ["buyer@test.com"] for message in sent_messages)
    assert all("EMAIL12345" in message.body for message in sent_messages)


def test_email_failure_does_not_fail_successful_payment(
    app, client, pending_transaction, monkeypatch
):
    """SMTP failures are isolated from the payment transaction."""
    app.config.update({"MAIL_USERNAME": "mailer@example.com", "MAIL_PASSWORD": "app-password"})

    def raise_smtp_error(message):
        raise RuntimeError("SMTP unavailable")

    monkeypatch.setattr("app.email_utils.mail.send", raise_smtp_error)
    response = client.post(
        "/api/payments/callback",
        json=_successful_callback(pending_transaction.checkout_request_id),
    )

    assert response.status_code == 200
    assert response.get_json()["transaction"]["status"] == "SUCCESS"
