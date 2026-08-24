def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "John Doe",
            "email": "john@test.com",
            "phone": "0712345678",
            "password": "password123",
            "role": "BUYER",
            "location": "Nairobi"
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["full_name"] == "John Doe"
    assert data["email"] == "john@test.com"
    assert data["phone"] == "0712345678"
    assert data["role"] == "BUYER"

    # Password should not be returned
    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_email(client):
    client.post(
        "/api/auth/register",
        json={
            "full_name": "John Doe",
            "email": "john@test.com",
            "phone": "0712345678",
            "password": "password123",
            "role": "BUYER"
        }
    )

    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Jane Doe",
            "email": "john@test.com",
            "phone": "0722222222",
            "password": "password123",
            "role": "BUYER"
        }
    )

    assert response.status_code == 409

    data = response.get_json()

    assert data["error"] == "Email already exists"