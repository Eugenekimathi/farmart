"""
M-Pesa Payment Service
Handles STK Push requests for Lipa na M-Pesa Online payments.
"""
import os
import base64
import datetime
from flask import current_app
import requests


class MpesaService:
    """Service for M-Pesa STK Push payment integration"""

    def __init__(self):
        self.consumer_key = os.getenv('MPESA_CONSUMER_KEY')
        self.consumer_secret = os.getenv('MPESA_CONSUMER_SECRET')
        self.passkey = os.getenv('MPESA_PASSKEY')
        self.shortcode = os.getenv('MPESA_SHORTCODE')
        self.environment = os.getenv('MPESA_ENVIRONMENT', 'sandbox')
        self.callback_url = os.getenv('MPESA_CALLBACK_URL')

    def _get_environment_url(self):
        """Get the appropriate M-Pesa API URL based on environment"""
        if self.environment == 'live':
            base_url = 'https://api.safaricom.co.ke'
        else:
            base_url = 'https://sandbox.safaricom.co.ke'
        return base_url

    def _generate_password(self):
        """Generate M-Pesa API password"""
        timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        password_str = f"{self.shortcode}{self.passkey}{timestamp}"
        password_bytes = password_str.encode('ascii')
        return base64.b64encode(password_bytes).decode('utf-8'), timestamp

    def _get_access_token(self):
        """Get M-Pesa API access token"""
        if not self.consumer_key or not self.consumer_secret:
            raise ValueError("M-Pesa credentials not configured")

        auth_url = f"{self._get_environment_url()}/oauth/v1/generate?grant_type=client_credentials"
        auth = requests.get(
            auth_url,
            auth=(self.consumer_key, self.consumer_secret)
        )

        if auth.status_code != 200:
            raise Exception(f"Failed to get access token: {auth.text}")

        return auth.json().get('access_token')

    def initiate_stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """
        Initiate STK Push request to customer's phone

        Args:
            phone_number: Customer phone number (format: 254XXXXXXXXX)
            amount: Amount to charge
            account_reference: Reference for the transaction (e.g., order ID)
            transaction_desc: Description of the transaction

        Returns:
            dict: Response from M-Pesa API
        """
        try:
            if not all([self.consumer_key, self.consumer_secret, self.passkey, self.shortcode]):
                return {
                    'success': False,
                    'error': 'M-Pesa credentials not configured',
                    'message': 'Payment integration requires API credentials'
                }

            access_token = self._get_access_token()
            password, timestamp = self._generate_password()

            stk_push_url = f"{self._get_environment_url()}/mpesa/stkpush/v1/processrequest"

            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }

            payload = {
                'BusinessShortCode': self.shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'TransactionType': 'CustomerPayBillOnline',
                'Amount': amount,
                'PartyA': phone_number,
                'PartyB': self.shortcode,
                'PhoneNumber': phone_number,
                'CallBackURL': self.callback_url,
                'AccountReference': account_reference,
                'TransactionDesc': transaction_desc
            }

            response = requests.post(stk_push_url, json=payload, headers=headers)

            if response.status_code == 200:
                return {
                    'success': True,
                    'data': response.json(),
                    'message': 'STK Push initiated successfully'
                }
            else:
                return {
                    'success': False,
                    'error': response.text,
                    'message': 'Failed to initiate STK Push'
                }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Error processing M-Pesa payment'
            }

    def format_phone_number(self, phone):
        """Format phone number to M-Pesa format (254XXXXXXXXX)"""
        # Remove spaces, dashes, and +
        phone = phone.replace(' ', '').replace('-', '').replace('+', '')

        # If starts with 07, convert to 2547
        if phone.startswith('07'):
            return '254' + phone[1:]

        # If starts with 254, return as is
        if phone.startswith('254'):
            return phone

        # If starts with 7, add 254
        if phone.startswith('7'):
            return '254' + phone

        return phone


# Singleton instance
mpesa_service = MpesaService()
