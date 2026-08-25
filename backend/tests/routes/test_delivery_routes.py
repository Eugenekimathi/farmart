def test_create_delivery(client, order):
    response = client.post(
        "/api/deliveries",
        json={
            "order_id": order.id,
            "delivery_address": "123 Nairobi Road",
            "delivery_phone": "0712345678",
            "tracking_reference": "TRACK12345"
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["order_id"] == order.id
    assert data["delivery_address"] == "123 Nairobi Road"
    assert data["delivery_phone"] == "0712345678"
    assert data["tracking_reference"] == "TRACK12345"
    assert data["status"] == "PENDING"


def test_create_delivery_order_not_found(client):
    response = client.post(
        "/api/deliveries",
        json={
            "order_id": 99999,
            "delivery_address": "123 Nairobi Road",
            "delivery_phone": "0712345678",
            "tracking_reference": "TRACK12345"
        }
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Order not found"


def test_get_deliveries(client, delivery):
    response = client.get(
        "/api/deliveries"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert len(data) == 1
    assert data[0]["id"] == delivery.id
    assert data[0]["order_id"] == delivery.order_id
    assert data[0]["delivery_address"] == (
        delivery.delivery_address
    )


def test_get_delivery(client, delivery):
    response = client.get(
        f"/api/deliveries/{delivery.id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == delivery.id
    assert data["order_id"] == delivery.order_id
    assert data["delivery_address"] == (
        delivery.delivery_address
    )
    assert data["delivery_phone"] == (
        delivery.delivery_phone
    )
    assert data["status"] == delivery.status


def test_get_delivery_not_found(client):
    response = client.get(
        "/api/deliveries/99999"
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Delivery not found"


def test_update_delivery_status(client, delivery):
    response = client.patch(
        f"/api/deliveries/{delivery.id}/status",
        json={
            "status": "PROCESSING"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == delivery.id
    assert data["status"] == "PROCESSING"


def test_update_delivery_status_out_for_delivery(
    client,
    delivery
):
    response = client.patch(
        f"/api/deliveries/{delivery.id}/status",
        json={
            "status": "OUT_FOR_DELIVERY"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "OUT_FOR_DELIVERY"


def test_update_delivery_status_delivered(
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


def test_update_delivery_status_cancelled(
    client,
    delivery
):
    response = client.patch(
        f"/api/deliveries/{delivery.id}/status",
        json={
            "status": "CANCELLED"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "CANCELLED"


def test_update_delivery_status_invalid(
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


def test_update_delivery_status_not_found(client):
    response = client.patch(
        "/api/deliveries/99999/status",
        json={
            "status": "DELIVERED"
        }
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Delivery not found"
