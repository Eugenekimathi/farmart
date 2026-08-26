def create_user(session):
    from app.models.user import User

    user = User(
        full_name="Test Farmer",
        email="farmer@test.com",
        phone="0712345678",
        password_hash="hashed-password",
        role="FARMER"
    )

    session.add(user)
    session.commit()

    return user


def test_create_farmer(client, session):
    user = create_user(session)

    response = client.post(
        "/api/farmers",
        json={
            "user_id": user.id,
            "farm_name": "Green Farm",
            "farm_location": "Nairobi",
            "description": "Test farm"
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["user_id"] == user.id
    assert data["farm_name"] == "Green Farm"
    assert data["farm_location"] == "Nairobi"


def test_get_farmers(client, farmer):
    response = client.get("/api/farmers")

    assert response.status_code == 200

    data = response.get_json()

    assert len(data["farmers"]) == 1
    assert data["farmers"][0]["id"] == farmer.id


def test_get_farmer(client, farmer):
    response = client.get(
        f"/api/farmers/{farmer.id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == farmer.id
    assert data["farm_name"] == farmer.farm_name


def test_get_farmer_not_found(client):
    response = client.get("/api/farmers/99999")

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Farmer not found"


def test_update_farmer(client, farmer):
    response = client.put(
        f"/api/farmers/{farmer.id}",
        json={
            "user_id": farmer.user_id,
            "farm_name": "Updated Farm",
            "farm_location": "Mombasa",
            "description": "Updated description"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["farm_name"] == "Updated Farm"
    assert data["farm_location"] == "Mombasa"


def test_delete_farmer(client, farmer):
    response = client.delete(
        f"/api/farmers/{farmer.id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Farmer deleted successfully"