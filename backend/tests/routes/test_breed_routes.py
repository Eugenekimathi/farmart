def test_create_breed(client, animal_type):
    response = client.post(
        "/api/breeds",
        json={
            "animal_type_id": animal_type.id,
            "name": "Friesian",
            "description": "Dairy cattle breed"
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["animal_type_id"] == animal_type.id
    assert data["name"] == "Friesian"


def test_get_breeds(client, breed):
    response = client.get("/api/breeds")

    assert response.status_code == 200

    data = response.get_json()

    assert len(data) == 1
    assert data[0]["id"] == breed.id


def test_get_breed(client, breed):
    response = client.get(
        f"/api/breeds/{breed.id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == breed.id
    assert data["name"] == breed.name


def test_get_breed_not_found(client):
    response = client.get("/api/breeds/99999")

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Breed not found"


def test_update_breed(client, breed):
    response = client.put(
        f"/api/breeds/{breed.id}",
        json={
            "animal_type_id": breed.animal_type_id,
            "name": "Updated Friesian",
            "description": "Updated breed"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["name"] == "Updated Friesian"


def test_delete_breed(client, breed):
    response = client.delete(
        f"/api/breeds/{breed.id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Breed deleted successfully"