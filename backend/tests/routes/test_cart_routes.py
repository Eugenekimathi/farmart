def test_create_cart(client, user):
    response = client.post(
        "/api/carts",
        json={
            "user_id": user.id
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["id"] is not None
    assert data["user_id"] == user.id


def test_create_cart_requires_user_id(client):
    response = client.post(
        "/api/carts",
        json={}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "user_id is required"


def test_create_cart_returns_existing_cart(client, user):
    first_response = client.post(
        "/api/carts",
        json={
            "user_id": user.id
        }
    )

    first_data = first_response.get_json()

    second_response = client.post(
        "/api/carts",
        json={
            "user_id": user.id
        }
    )

    assert second_response.status_code == 200

    second_data = second_response.get_json()

    assert second_data["id"] == first_data["id"]
    assert second_data["user_id"] == user.id


def test_add_available_animal_to_cart(
    client,
    user,
    animal
):
    cart_response = client.post(
        "/api/carts",
        json={
            "user_id": user.id
        }
    )

    cart_id = cart_response.get_json()["id"]

    response = client.post(
        f"/api/carts/{cart_id}/items",
        json={
            "animal_id": animal.id
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["message"] == "Animal added to cart"
    assert data["cart_item_id"] is not None


def test_add_animal_to_nonexistent_cart(
    client,
    animal
):
    response = client.post(
        "/api/carts/9999/items",
        json={
            "animal_id": animal.id
        }
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Cart not found"


def test_add_nonexistent_animal_to_cart(
    client,
    user
):
    cart_response = client.post(
        "/api/carts",
        json={
            "user_id": user.id
        }
    )

    cart_id = cart_response.get_json()["id"]

    response = client.post(
        f"/api/carts/{cart_id}/items",
        json={
            "animal_id": 9999
        }
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Animal not found"


def test_cannot_add_unavailable_animal_to_cart(
    client,
    user,
    animal,
    session
):
    animal.status = "SOLD"
    session.commit()

    cart_response = client.post(
        "/api/carts",
        json={
            "user_id": user.id
        }
    )

    cart_id = cart_response.get_json()["id"]

    response = client.post(
        f"/api/carts/{cart_id}/items",
        json={
            "animal_id": animal.id
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "Animal is not available"


def test_cannot_add_same_animal_twice(
    client,
    user,
    animal
):
    cart_response = client.post(
        "/api/carts",
        json={
            "user_id": user.id
        }
    )

    cart_id = cart_response.get_json()["id"]

    first_response = client.post(
        f"/api/carts/{cart_id}/items",
        json={
            "animal_id": animal.id
        }
    )

    assert first_response.status_code == 201

    second_response = client.post(
        f"/api/carts/{cart_id}/items",
        json={
            "animal_id": animal.id
        }
    )

    assert second_response.status_code == 409

    data = second_response.get_json()

    assert data["error"] == "Animal already exists in cart"