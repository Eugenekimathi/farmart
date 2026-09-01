
def test_farmer_can_retrieve_own_animals_from_mine_endpoint(client, animal):
    response = client.get('/api/animals/mine')
    assert response.status_code == 200
    assert [item['id'] for item in response.get_json()['animals']] == [animal.id]


def test_buyer_cannot_retrieve_farmer_animals_from_mine_endpoint(buyer_client):
    response = buyer_client.get('/api/animals/mine')
    assert response.status_code == 403
