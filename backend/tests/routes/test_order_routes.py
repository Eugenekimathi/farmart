def test_create_order(buyer_client, user):

    response = buyer_client.post(
        "/api/orders",
        json={
            "buyer_id": user.id,
            "total_amount": "5000.00",
            "delivery_address": "Nairobi, Kenya",
            "delivery_phone": "0712345678"
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["id"] is not None
    assert data["buyer_id"] == user.id
    assert data["total_amount"] == "5000.00"
    assert data["delivery_address"] == "Nairobi, Kenya"
    assert data["delivery_phone"] == "0712345678"
    assert data["status"] == "PENDING"


def test_get_orders(buyer_client, user):

    # Create an order first
    create_response = buyer_client.post(
        "/api/orders",
        json={
            "buyer_id": user.id,
            "total_amount": "5000.00",
            "delivery_address": "Nairobi, Kenya",
            "delivery_phone": "0712345678"
        }
    )

    assert create_response.status_code == 201

    response = buyer_client.get(
        "/api/orders"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert isinstance(data, dict)
    assert len(data["orders"]) >= 1
    assert data["current_page"] == 1
    assert data["total_count"] >= 1


def test_get_order(buyer_client, user):

    create_response = buyer_client.post(
        "/api/orders",
        json={
            "buyer_id": user.id,
            "total_amount": "5000.00",
            "delivery_address": "Nairobi, Kenya",
            "delivery_phone": "0712345678"
        }
    )

    assert create_response.status_code == 201

    order_id = create_response.get_json()["id"]

    response = buyer_client.get(
        f"/api/orders/{order_id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == order_id
    assert data["buyer_id"] == user.id
    assert data["total_amount"] == "5000.00"
    assert data["delivery_address"] == "Nairobi, Kenya"
    assert data["delivery_phone"] == "0712345678"
    assert data["status"] == "PENDING"


def test_get_nonexistent_order(client):

    response = client.get(
        "/api/orders/9999"
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Order not found"


def test_update_order_status(buyer_client, farmer_client, user, cart_item):

    create_response = buyer_client.post(
        "/api/orders",
        json={
            "buyer_id": user.id,
            "total_amount": "5000.00",
            "delivery_address": "Nairobi, Kenya",
            "delivery_phone": "0712345678"
        }
    )

    assert create_response.status_code == 201

    order_id = create_response.get_json()["id"]

    response = farmer_client.patch(
        f"/api/orders/{order_id}/status",
        json={
            "status": "CONFIRMED"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == order_id
    assert data["status"] == "CONFIRMED"


def test_update_order_status_to_rejected(buyer_client, farmer_client, user, cart_item):

    create_response = buyer_client.post(
        "/api/orders",
        json={
            "buyer_id": user.id,
            "total_amount": "5000.00",
            "delivery_address": "Nairobi, Kenya",
            "delivery_phone": "0712345678"
        }
    )

    assert create_response.status_code == 201

    order_id = create_response.get_json()["id"]

    response = farmer_client.patch(
        f"/api/orders/{order_id}/status",
        json={
            "status": "REJECTED"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "REJECTED"


def test_update_order_status_to_cancelled(buyer_client, user):

    create_response = buyer_client.post(
        "/api/orders",
        json={
            "buyer_id": user.id,
            "total_amount": "5000.00",
            "delivery_address": "Nairobi, Kenya",
            "delivery_phone": "0712345678"
        }
    )

    assert create_response.status_code == 201

    order_id = create_response.get_json()["id"]

    response = buyer_client.patch(
        f"/api/orders/{order_id}/status",
        json={
            "status": "CANCELLED"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "CANCELLED"


def test_update_order_invalid_status(buyer_client, farmer_client, user, cart_item):

    create_response = buyer_client.post(
        "/api/orders",
        json={
            "buyer_id": user.id,
            "total_amount": "5000.00",
            "delivery_address": "Nairobi, Kenya",
            "delivery_phone": "0712345678"
        }
    )

    assert create_response.status_code == 201

    order_id = create_response.get_json()["id"]

    response = farmer_client.patch(
        f"/api/orders/{order_id}/status",
        json={
            "status": "INVALID"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "Invalid order status"


def test_update_nonexistent_order_status(client):

    response = client.patch(
        "/api/orders/9999/status",
        json={
            "status": "CONFIRMED"
        }
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Order not found"