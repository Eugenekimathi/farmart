import base64
from datetime import datetime

import requests
from flask import current_app


def generate_access_token():
    """Fetch an OAuth access token from Daraja using consumer key/secret."""
    consumer_key = current_app.config['CONSUMER_KEY']
    consumer_secret = current_app.config['CONSUMER_SECRET']
    base_url = current_app.config['BASE_URL']

    auth_url = f'{base_url}/oauth/v1/generate?grant_type=client_credentials'
    response = requests.get(auth_url, auth=(consumer_key, consumer_secret), timeout=15)
    response.raise_for_status()
    return response.json().get('access_token')


def generate_password_and_timestamp():
    """Build the base64 Lipa Na M-Pesa security credential + matching timestamp."""
    shortcode = current_app.config['SHORTCODE']
    passkey = current_app.config['PASSKEY']

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    data_to_encode = f'{shortcode}{passkey}{timestamp}'
    password = base64.b64encode(data_to_encode.encode()).decode()

    return password, timestamp