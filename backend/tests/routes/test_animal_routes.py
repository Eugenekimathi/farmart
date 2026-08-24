def test_create_animal(client, farmer, animal_type, breed):
    response = client.post(
        "/api/animals",
        json={
            "farmer_id": farmer.id,
            "animal_type_id": animal_type.id,
            "breed_id": breed.id,
            "name": "Cow 001",
            "gender": "FEMALE",
            "age": 3,
            "price": "100000.00",
            "description": "Healthy dairy cow",
            "location": "Nairobi",
            "status": "AVAILABLE"
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["farmer_id"] == farmer.id
    assert data["animal_type_id"] == animal_type.id
    assert data["breed_id"] == breed.id
    assert data["name"] == "Cow 001"
    assert data["gender"] == "FEMALE"
    assert data["age"] == 3
    assert data["price"] == "100000.00"
    assert data["status"] == "AVAILABLE"


def test_get_animals(client, animal):
    response = client.get("/api/animals")

    assert response.status_code == 200

    data = response.get_json()

    assert len(data) == 1
    assert data[0]["id"] == animal.id


def test_get_animal(client, animal):
    response = client.get(
        f"/api/animals/{animal.id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == animal.id
    assert data["name"] == animal.name


def test_get_animal_not_found(client):
    response = client.get("/api/animals/99999")

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Animal not found"


def test_update_animal(client, animal):
    response = client.put(
        f"/api/animals/{animal.id}",
        json={
            "farmer_id": animal.farmer_id,
            "animal_type_id": animal.animal_type_id,
            "breed_id": animal.breed_id,
            "name": "Updated Cow",
            "gender": "FEMALE",
            "age": 4,
            "price": "120000.00",
            "description": "Updated description",
            "location": "Nairobi",
            "status": "AVAILABLE"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["name"] == "Updated Cow"
    assert data["age"] == 4
    assert data["price"] == "120000.00"


def test_delete_animal(client, animal):
    response = client.delete(
        f"/api/animals/{animal.id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Animal deleted successfully"