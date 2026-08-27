def test_payment_amount_must_match_order_total(
    client,
    order
):

    response = client.post(
        "/api/payments",
        json={
            "order_id": order.id,
            "amount": "1.00",
            "payment_method": "MPESA",
            "transaction_reference": "REF12345"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == (
        "Payment amount does not match order total"
    )


def test_payment_requires_existing_order(client):

    response = client.post(
        "/api/payments",
        json={
            "order_id": 99999,
            "amount": "1000.00",
            "payment_method": "MPESA",
            "transaction_reference": "REF12345"
        }
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Order not found"


def test_payment_amount_must_be_positive(
    client,
    order
):

    response = client.post(
        "/api/payments",
        json={
            "order_id": order.id,
            "amount": "0",
            "payment_method": "MPESA",
            "transaction_reference": "REF12345"
        }
    )

    assert response.status_code == 400


def test_payment_method_must_be_valid(
    client,
    order
):

    response = client.post(
        "/api/payments",
        json={
            "order_id": order.id,
            "amount": str(order.total_amount),
            "payment_method": "CASH",
            "transaction_reference": "REF12345"
        }
    )

    assert response.status_code == 400


def test_payment_defaults_to_pending(
    client,
    order
):

    response = client.post(
        "/api/payments",
        json={
            "order_id": order.id,
            "amount": str(order.total_amount),
            "payment_method": "MPESA",
            "transaction_reference": "REF12345"
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["status"] == "PENDING"


def test_payment_status_cannot_be_invalid(
    client,
    payment
):

    response = client.patch(
        f"/api/payments/{payment.id}/status",
        json={
            "status": "INVALID"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "Invalid payment status"
