def test_pending_order_can_be_confirmed(
    client,
    order
):

    response = client.patch(
        f"/api/orders/{order.id}/status",
        json={
            "status": "CONFIRMED"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "CONFIRMED"


def test_rejected_order_cannot_be_confirmed(
    client,
    order,
    session
):

    order.status = "REJECTED"
    session.commit()

    response = client.patch(
        f"/api/orders/{order.id}/status",
        json={
            "status": "CONFIRMED"
        }
    )

    assert response.status_code in [400, 409]


def test_cancelled_order_cannot_be_confirmed(
    client,
    order,
    session
):

    order.status = "CANCELLED"
    session.commit()

    response = client.patch(
        f"/api/orders/{order.id}/status",
        json={
            "status": "CONFIRMED"
        }
    )

    assert response.status_code in [400, 409]


def test_confirmed_order_cannot_return_to_pending(
    client,
    order,
    session
):

    order.status = "CONFIRMED"
    session.commit()

    response = client.patch(
        f"/api/orders/{order.id}/status",
        json={
            "status": "PENDING"
        }
    )

    assert response.status_code in [400, 409]


def test_invalid_order_status_is_rejected(
    client,
    order
):

    response = client.patch(
        f"/api/orders/{order.id}/status",
        json={
            "status": "INVALID"
        }
    )

    assert response.status_code == 400

def test_pending_order_can_be_confirmed(
    client,
    order
):

    response = client.patch(
        f"/api/orders/{order.id}/status",
        json={
            "status": "CONFIRMED"
        }
    )

    assert response.status_code == 200


def test_pending_order_can_be_rejected(
    client,
    order
):

    response = client.patch(
        f"/api/orders/{order.id}/status",
        json={
            "status": "REJECTED"
        }
    )

    assert response.status_code == 200


def test_pending_order_can_be_cancelled(
    buyer_client,
    order
):

    response = buyer_client.patch(
        f"/api/orders/{order.id}/status",
        json={
            "status": "CANCELLED"
        }
    )

    assert response.status_code == 200


def test_confirmed_order_can_be_completed(
    client,
    order,
    session
):

    order.status = "CONFIRMED"
    session.commit()

    response = client.patch(
        f"/api/orders/{order.id}/status",
        json={
            "status": "COMPLETED"
        }
    )

    assert response.status_code == 200


def test_completed_order_cannot_be_confirmed(
    client,
    order,
    session
):

    order.status = "COMPLETED"
    session.commit()

    response = client.patch(
        f"/api/orders/{order.id}/status",
        json={
            "status": "CONFIRMED"
        }
    )

    assert response.status_code == 409
