def test_create_payment(client, order):
    response = client.post(
        "/api/payments",
        json={
            "order_id": order.id,
            "amount": str(order.total_amount),
            "payment_method": "MPESA",
            "transaction_reference": "MPESA12345"
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["order_id"] == order.id
    assert data["amount"] == str(order.total_amount)
    assert data["payment_method"] == "MPESA"
    assert data["transaction_reference"] == "MPESA12345"
    assert data["status"] == "PENDING"


def test_create_payment_order_not_found(client):
    response = client.post(
        "/api/payments",
        json={
            "order_id": 99999,
            "amount": "1000.00",
            "payment_method": "MPESA",
            "transaction_reference": "MPESA12345"
        }
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Order not found"


def test_create_payment_amount_mismatch(
    client,
    order
):
    response = client.post(
        "/api/payments",
        json={
            "order_id": order.id,
            "amount": "1.00",
            "payment_method": "MPESA",
            "transaction_reference": "MPESA12345"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == (
        "Payment amount does not match order total"
    )


def test_get_payments(client, payment):
    response = client.get(
        "/api/payments"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert len(data) == 1
    assert data[0]["id"] == payment.id
    assert data[0]["order_id"] == payment.order_id
    assert data[0]["payment_method"] == payment.payment_method


def test_get_payment(client, payment):
    response = client.get(
        f"/api/payments/{payment.id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == payment.id
    assert data["order_id"] == payment.order_id
    assert data["amount"] == str(payment.amount)
    assert data["payment_method"] == payment.payment_method
    assert data["status"] == payment.status


def test_get_payment_not_found(client):
    response = client.get(
        "/api/payments/99999"
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Payment not found"


def test_update_payment_status(client, payment):
    response = client.patch(
        f"/api/payments/{payment.id}/status",
        json={
            "status": "SUCCESS"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == payment.id
    assert data["status"] == "SUCCESS"


def test_update_payment_status_failed(client, payment):
    response = client.patch(
        f"/api/payments/{payment.id}/status",
        json={
            "status": "FAILED"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "FAILED"


def test_update_payment_status_cancelled(client, payment):
    response = client.patch(
        f"/api/payments/{payment.id}/status",
        json={
            "status": "CANCELLED"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "CANCELLED"


def test_update_payment_status_invalid(client, payment):
    response = client.patch(
        f"/api/payments/{payment.id}/status",
        json={
            "status": "INVALID"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "Invalid payment status"


def test_update_payment_status_not_found(client):
    response = client.patch(
        "/api/payments/99999/status",
        json={
            "status": "SUCCESS"
        }
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Payment not found"


# def test_duplicate_payment_callback_is_idempotent(
#     client,
#     order
# ):

#     payload = {
#         "order_id": order.id,
#         "amount": str(order.total_amount),
#         "payment_method": "MPESA",
#         "transaction_reference": "MPESA12345",
#         "status": "SUCCESS"
#     }

#     first_response = client.post(
#         "/api/payments/callback",
#         json=payload
#     )

#     assert first_response.status_code in [200, 201]

#     second_response = client.post(
#         "/api/payments/callback",
#         json=payload
#     )

#     assert second_response.status_code == 200

#     first_data = first_response.get_json()
#     second_data = second_response.get_json()

#     assert first_data["id"] == second_data["id"]
#     assert second_data["status"] == "SUCCESS"
