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
    # Register now auto-logs-in: returns { user, token }
    assert "token" in data
    user = data["user"]
    assert user["full_name"] == "John Doe"
    assert user["email"] == "john@test.com"
    assert user["phone"] == "0712345678"
    assert user["role"] == "buyer"
    # Password should not be returned
    assert "password" not in user
    assert "password_hash" not in user


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

def test_login_success(client):
    client.post(
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
    response = client.post(
        "/api/auth/login",
        json={
            "email": "john@test.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.get_json()
    assert "token" in data
    assert data["user"]["email"] == "john@test.com"
    assert data["user"]["role"] == "buyer"


def test_login_wrong_password(client):
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
        "/api/auth/login",
        json={
            "email": "john@test.com",
            "password": "wrong-password"
        }
    )
    assert response.status_code == 401
    data = response.get_json()
    assert data["message"] == "Invalid email or password"


def test_login_unknown_email(client):
    response = client.post(
        "/api/auth/login",
        json={
            "email": "nobody@test.com",
            "password": "password123"
        }
    )
    assert response.status_code == 401


def test_login_missing_fields(client):
    response = client.post(
        "/api/auth/login",
        json={"email": ""}
    )
    assert response.status_code == 400
