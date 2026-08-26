def test_delivery_requires_existing_order(client):

    response = client.post(
        "/api/deliveries",
        json={
            "order_id": 99999,
            "delivery_address": "Nairobi",
            "delivery_phone": "0712345678"
        }
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Order not found"


def test_delivery_defaults_to_pending(
    client,
    order
):

    response = client.post(
        "/api/deliveries",
        json={
            "order_id": order.id,
            "delivery_address": "Nairobi",
            "delivery_phone": "0712345678"
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["status"] == "PENDING"


def test_pending_delivery_can_be_processing(
    client,
    delivery
):

    response = client.patch(
        f"/api/deliveries/{delivery.id}/status",
        json={
            "status": "PROCESSING"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "PROCESSING"


def test_processing_delivery_can_be_out_for_delivery(
    client,
    delivery,
    session
):

    delivery.status = "PROCESSING"
    session.commit()

    response = client.patch(
        f"/api/deliveries/{delivery.id}/status",
        json={
            "status": "OUT_FOR_DELIVERY"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "OUT_FOR_DELIVERY"


def test_delivery_can_be_delivered(
    client,
    delivery
):

    response = client.patch(
        f"/api/deliveries/{delivery.id}/status",
        json={
            "status": "DELIVERED"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "DELIVERED"


def test_invalid_delivery_status_is_rejected(
    client,
    delivery
):

    response = client.patch(
        f"/api/deliveries/{delivery.id}/status",
        json={
            "status": "INVALID"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "Invalid delivery status"
