def test_create_animal_type(client):
    response = client.post(
        "/api/animal-types",
        json={
            "name": "Cattle",
            "description": "Cattle animals"
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["name"] == "Cattle"
    assert data["description"] == "Cattle animals"


def test_get_animal_types(client, animal_type):
    response = client.get("/api/animal-types")

    assert response.status_code == 200

    data = response.get_json()

    assert len(data) == 1
    assert data[0]["id"] == animal_type.id


def test_get_animal_type(client, animal_type):
    response = client.get(
        f"/api/animal-types/{animal_type.id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == animal_type.id
    assert data["name"] == animal_type.name


def test_get_animal_type_not_found(client):
    response = client.get("/api/animal-types/99999")

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Animal type not found"


def test_update_animal_type(client, animal_type):
    response = client.put(
        f"/api/animal-types/{animal_type.id}",
        json={
            "name": "Updated Cattle",
            "description": "Updated description"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["name"] == "Updated Cattle"


def test_delete_animal_type(client, animal_type):
    response = client.delete(
        f"/api/animal-types/{animal_type.id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Animal type deleted successfully"