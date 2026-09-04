def test_assistant_chat_returns_marketplace_response(client, animal):
    response = client.post("/api/assistant/chat", json={"message": "What animals are available?"})
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["conversation_id"]
    assert data["metadata"]["recommendations"][0]["id"] == animal.id


def test_assistant_chat_validates_message(client):
    response = client.post("/api/assistant/chat", json={"message": ""})
    assert response.status_code == 400


def test_assistant_chat_rejects_whitespace_message(client):
    response = client.post("/api/assistant/chat", json={"message": "   "})
    assert response.status_code == 400
