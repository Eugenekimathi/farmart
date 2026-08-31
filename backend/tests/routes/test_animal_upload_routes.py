from io import BytesIO

def multipart_animal(animal_type, **extra):
    data = {
        "animal_type_id": str(animal_type.id),
        "name": "Kienyeji Chicken",
        "gender": "female",
        "age": "8",
        "price": "1500.00",
        "location": "Kiambu",
        "description": "Healthy chicken",
    }
    data.update(extra)
    return data

def test_farmer_can_create_animal_without_breed(client, farmer, animal_type):
    response = client.post(
        "/api/animals",
        data=multipart_animal(animal_type),
        content_type="multipart/form-data",
    )

    assert response.status_code == 201
    assert response.get_json()["breed_id"] is None

def test_farmer_can_create_animal_with_primary_image(client, farmer, animal_type, breed):
    data = multipart_animal(
        animal_type,
        breed_id=str(breed.id),
        primary_image_index="1",
        images=[
            (BytesIO(b"first image"), "first.jpg"),
            (BytesIO(b"second image"), "second.png"),
        ],
    )

    response = client.post(
        "/api/animals",
        data=data,
        content_type="multipart/form-data",
    )

    assert response.status_code == 201
    images = response.get_json()["images"]
    assert len(images) == 2
    assert images[0]["image_url"].endswith(".jpg")
    assert images[1]["image_url"].endswith(".png")
    assert images[1]["is_primary"] is True

def test_rejects_breed_from_a_different_animal_type(client, farmer, animal_type, session):
    from app.models.animal_type import AnimalType
    from app.models.breed import Breed
    goats = AnimalType(name="Goats")
    session.add(goats)
    session.flush()
    goat_breed = Breed(animal_type_id=goats.id, name="Boer")
    session.add(goat_breed)
    session.commit()

    response = client.post(
        "/api/animals",
        data=multipart_animal(animal_type, breed_id=str(goat_breed.id)),
        content_type="multipart/form-data",
    )

    assert response.status_code == 400
    assert response.get_json()["error"] == "Breed does not belong to the selected animal type"
