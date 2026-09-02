"""
M-Pesa Payment Service
Handles STK Push requests, OAuth token generation, and callback processing
for Lipa na M-Pesa Online payments.
"""
import base64
import datetime
import logging
import os
import re

import requests
from flask import current_app, has_app_context

from app.extensions import db
from app.models.transaction import Transaction
from app.models.order import Order
from app.models.payment import Payment

logger = logging.getLogger(__name__)

# M-Pesa status values
MPESA_STATUS = {
    "PENDING": "PENDING",
    "SUCCESS": "SUCCESS",
    "FAILED": "FAILED",
    "CANCELLED": "CANCELLED",
    "TIMEOUT": "TIMEOUT",
}

# Daraja callback result codes
MPESA_RESULT_SUCCESS = "0"


class MpesaError(Exception):
    """Raised when M-Pesa API returns an error or is unreachable."""


def _config(key, default=None):
    """Resolve a config value from Flask app config or environment variable."""
    if has_app_context():
        return current_app.config.get(key, os.getenv(key, default))
    return os.getenv(key, default)


class MpesaService:
    """Service for M-Pesa STK Push payment integration."""

    def __init__(self):
        self.consumer_key = _config("MPESA_CONSUMER_KEY")
        self.consumer_secret = _config("MPESA_CONSUMER_SECRET")
        self.passkey = _config("MPESA_PASSKEY")
        self.shortcode = _config("MPESA_SHORTCODE")
        self.environment = _config("MPESA_ENVIRONMENT", "sandbox")
        self.callback_url = _config("MPESA_CALLBACK_URL")

    def _get_environment_url(self):
        """Get the appropriate M-Pesa API URL based on environment."""
        if self.environment == "live":
            return "https://api.safaricom.co.ke"
        return "https://sandbox.safaricom.co.ke"

    def _generate_timestamp(self):
        """Generate M-Pesa timestamp in YYYYMMDDHHMMSS format."""
        return datetime.datetime.now().strftime("%Y%m%d%H%M%S")

    def _generate_password(self):
        """Generate M-Pesa API password: base64(shortcode + passkey + timestamp)."""
        timestamp = self._generate_timestamp()
        password_str = f"{self.shortcode}{self.passkey}{timestamp}"
        password_bytes = password_str.encode("ascii")
        return base64.b64encode(password_bytes).decode("utf-8"), timestamp

    def _get_access_token(self):
        """Get M-Pesa API access token using Basic Auth."""
        if not self.consumer_key or not self.consumer_secret:
            raise MpesaError("M-Pesa credentials not configured")

        auth_url = f"{self._get_environment_url()}/oauth/v1/generate?grant_type=client_credentials"

        try:
            response = requests.get(
                auth_url,
                auth=(self.consumer_key, self.consumer_secret),
                timeout=15,
            )
        except requests.RequestException as exc:
            logger.error("M-Pesa OAuth request failed: %s", exc)
            raise MpesaError("M-Pesa OAuth request failed") from exc

        if response.status_code != 200:
            logger.error("M-Pesa OAuth failed with status %s", response.status_code)
            raise MpesaError("Failed to get M-Pesa access token")

        data = response.json()
        access_token = data.get("access_token")
        if not access_token:
            logger.error("M-Pesa OAuth response missing access_token")
            raise MpesaError("M-Pesa OAuth response missing access_token")

        return access_token

    def format_phone_number(self, phone):
        """Format phone number to M-Pesa format (254XXXXXXXXX)."""
        if not phone:
            return phone
        # Remove spaces, dashes, and +
        phone = re.sub(r"[\s\-+]", "", phone)

        # If starts with 07, convert to 2547
        if phone.startswith("07"):
            return "254" + phone[1:]

        # If starts with 254, return as is
        if phone.startswith("254"):
            return phone

        # If starts with 7, add 254
        if phone.startswith("7"):
            return "254" + phone

        return phone

    def initiate_stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """
        Initiate STK Push request to customer's phone.

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
                logger.error("M-Pesa credentials not configured")
                return {
                    "success": False,
                    "error": "M-Pesa credentials not configured",
                    "message": "Payment integration requires API credentials",
                }

            access_token = self._get_access_token()
            password, timestamp = self._generate_password()

            stk_push_url = f"{self._get_environment_url()}/mpesa/stkpush/v1/processrequest"

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            }

            payload = {
                "BusinessShortCode": self.shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": phone_number,
                "PartyB": self.shortcode,
                "PhoneNumber": phone_number,
                "CallBackURL": self.callback_url,
                "AccountReference": account_reference,
                "TransactionDesc": transaction_desc,
            }

            try:
                response = requests.post(
                    stk_push_url,
                    json=payload,
                    headers=headers,
                    timeout=30,
                )
            except requests.RequestException as exc:
                logger.error("M-Pesa STK Push request failed: %s", exc)
                return {
                    "success": False,
                    "error": "M-Pesa STK Push request failed",
                    "message": "Payment request could not be sent. Please try again.",
                }

            if response.status_code == 200:
                data = response.json()
                logger.info(
                    "M-Pesa STK Push accepted for account %s",
                    account_reference,
                )
                return {
                    "success": True,
                    "data": data,
                    "message": "STK Push initiated successfully",
                }

            logger.error(
                "M-Pesa STK Push failed with status %s",
                response.status_code,
            )
            return {
                "success": False,
                "error": f"M-Pesa returned status {response.status_code}",
                "message": "Failed to initiate STK Push",
            }

        except MpesaError as exc:
            logger.error("M-Pesa service error: %s", exc)
            return {
                "success": False,
                "error": str(exc),
                "message": "Payment integration error. Please try again.",
            }
        except Exception as exc:  # pragma: no cover - defensive
            logger.exception("Unexpected M-Pesa error")
            return {
                "success": False,
                "error": str(exc),
                "message": "Error processing M-Pesa payment",
            }

    @staticmethod
    def _parse_callback_payload(payload):
        """Extract callback fields from the Daraja STK callback JSON."""
        body = payload.get("Body", {})
        stk_callback = body.get("stkCallback", {})
        checkout_request_id = stk_callback.get("CheckoutRequestID")
        merchant_request_id = stk_callback.get("MerchantRequestID")
        result_code = stk_callback.get("ResultCode")
        result_desc = stk_callback.get("ResultDesc")

        metadata_items = stk_callback.get("CallbackMetadata", {}).get("Item", [])
        metadata = {
            item.get("Name"): item.get("Value")
            for item in metadata_items
            if item.get("Name") is not None
        }

        return {
            "checkout_request_id": checkout_request_id,
            "merchant_request_id": merchant_request_id,
            "result_code": result_code,
            "result_description": result_desc,
            "amount": metadata.get("Amount"),
            "receipt_number": metadata.get("MpesaReceiptNumber"),
            "phone_number": metadata.get("PhoneNumber"),
            "transaction_date": metadata.get("TransactionDate"),
        }

    @staticmethod
    def _status_from_result_code(result_code):
        """Map Daraja ResultCode to our internal status."""
        # Daraja sends ResultCode as an integer; normalise to string for comparison.
        code = str(result_code) if result_code is not None else None
        if code == MPESA_RESULT_SUCCESS:
            return MPESA_STATUS["SUCCESS"]
        if code == "1032":
            return MPESA_STATUS["CANCELLED"]
        if code == "1037":
            return MPESA_STATUS["TIMEOUT"]
        return MPESA_STATUS["FAILED"]

    def process_callback(self, payload):
        """
        Process an M-Pesa STK callback idempotently.

        Duplicate callbacks for the same CheckoutRequestID are safe to call
        multiple times; the transaction is only updated, never duplicated.

        Returns:
            Transaction: The updated transaction.
        """
        fields = self._parse_callback_payload(payload)
        checkout_request_id = fields.get("checkout_request_id")

        if not checkout_request_id:
            logger.warning("M-Pesa callback missing CheckoutRequestID")
            raise MpesaError("M-Pesa callback missing CheckoutRequestID")

        transaction = Transaction.query.filter_by(
            checkout_request_id=checkout_request_id
        ).first()

        if not transaction:
            logger.warning(
                "M-Pesa callback for unknown CheckoutRequestID %s",
                checkout_request_id,
            )
            raise MpesaError("Unknown CheckoutRequestID")

        # Idempotent: if already SUCCESS, do not reprocess.
        if transaction.status == MPESA_STATUS["SUCCESS"]:
            logger.info(
                "M-Pesa callback ignored for already-successful transaction %s",
                checkout_request_id,
            )
            return transaction

        new_status = self._status_from_result_code(fields.get("result_code"))
        transaction.status = new_status
        transaction.result_code = str(fields.get("result_code")) if fields.get("result_code") is not None else None
        transaction.result_description = fields.get("result_description")
        transaction.merchant_request_id = fields.get("merchant_request_id") or transaction.merchant_request_id

        if fields.get("receipt_number"):
            transaction.receipt_number = fields.get("receipt_number")

        if fields.get("phone_number"):
            transaction.phone_number = str(fields.get("phone_number"))

        if fields.get("transaction_date"):
            raw_date = str(fields.get("transaction_date"))
            try:
                transaction.transaction_date = datetime.datetime.strptime(
                    raw_date, "%Y%m%d%H%M%S"
                )
            except ValueError:
                logger.warning("Invalid M-Pesa transaction date: %s", raw_date)

        db.session.commit()

        # If payment succeeded, update the linked order + payment record.
        if new_status == MPESA_STATUS["SUCCESS"]:
            self._finalize_successful_payment(transaction)

        logger.info(
            "M-Pesa callback processed for transaction %s: %s",
            checkout_request_id,
            new_status,
        )
        return transaction

    @staticmethod
    def _finalize_successful_payment(transaction):
        """Mark the order as paid and create/update the Payment record."""
        order = db.session.get(Order, transaction.order_id)
        if not order:
            logger.warning(
                "M-Pesa transaction %s references missing order %s",
                transaction.checkout_request_id,
                transaction.order_id,
            )
            return

        order.status = "CONFIRMED"

        payment = Payment.query.filter_by(order_id=order.id).first()
        if not payment:
            payment = Payment(
                order_id=order.id,
                amount=transaction.amount,
                payment_method="MPESA",
                transaction_reference=transaction.receipt_number or transaction.checkout_request_id,
                status="SUCCESS",
                paid_at=datetime.datetime.utcnow(),
            )
            db.session.add(payment)
        else:
            payment.status = "SUCCESS"
            payment.transaction_reference = transaction.receipt_number or transaction.checkout_request_id
            payment.paid_at = datetime.datetime.utcnow()

        db.session.commit()

        # Notifications are intentionally best-effort.  A delivery failure must
        # never roll back a confirmed payment, and duplicate callbacks return
        # before this point so they cannot send duplicate receipts.
        from app.email_utils import (
            send_buyer_transaction_email,
            send_farmer_transaction_email,
        )

        send_buyer_transaction_email(order.buyer, transaction, order)
        notified_farmer_ids = set()
        for item in order.order_items:
            if item.farmer_id in notified_farmer_ids:
                continue
            notified_farmer_ids.add(item.farmer_id)
            if item.farmer and item.farmer.user:
                send_farmer_transaction_email(item.farmer.user, transaction, order)


# Singleton instance
mpesa_service = MpesaService()
