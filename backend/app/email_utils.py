"""
Email notification utilities for Farmart.

Uses Flask-Mail (Gmail SMTP with App Password) to send transaction
notifications to farmers and buyers.

Email failures are logged and never raised — a failed email must not
break an otherwise-successful payment flow.
"""
import logging
from html import escape

from flask import current_app
from flask_mail import Mail, Message

logger = logging.getLogger(__name__)

# Lazy mail instance, initialised in create_app if configured.
mail = Mail()


def _mail_configured():
    """Return True if SMTP credentials are present in app config."""
    username = current_app.config.get("MAIL_USERNAME")
    password = current_app.config.get("MAIL_PASSWORD")
    return bool(username and password)


def _send_safe(subject, recipients, body, html_body=None):
    """Send an email safely; never raises. Returns True on success."""
    if not recipients:
        logger.warning("Email skipped: no recipients provided (subject=%s)", subject)
        return False
    if not _mail_configured():
        logger.warning("Email skipped: SMTP not configured (subject=%s)", subject)
        return False
    try:
        msg = Message(
            subject=subject,
            recipients=[recipients] if isinstance(recipients, str) else recipients,
            body=body,
            html=html_body,
        )
        mail.send(msg)
        logger.info("Email notification sent (subject=%s)", subject)
        return True
    except Exception:
        logger.exception("Email failed to send (subject=%s)", subject)
        return False


def _format_amount(amount):
    """Format a numeric amount as a readable currency string."""
    try:
        return f"KSh {float(amount):,.2f}"
    except (TypeError, ValueError):
        return str(amount)


def send_farmer_transaction_email(farmer_user, transaction, order=None):
    """Send a farmer a notification about a successful transaction."""
    if not farmer_user or not farmer_user.email:
        logger.warning("Farmer email skipped: no email address")
        return False

    amount = _format_amount(transaction.amount)
    receipt = transaction.receipt_number or transaction.checkout_request_id
    order_id = transaction.order_id
    order_ref = order.id if order else order_id

    name = farmer_user.full_name or "Farmer"
    subject = f"Farmart: Payment received for Order #{order_ref}"
    body = (
        f"Dear {name},\n\n"
        f"We are pleased to inform you that a payment has been received "
        f"for your order #{order_ref}.\n\n"
        f"Order ID: {order_ref}\n"
        f"Amount: {amount}\n"
        f"M-Pesa Receipt: {receipt}\n\n"
        "The buyer has been notified. Please prepare the livestock for "
        "delivery as agreed.\n\n"
        "Thank you for selling on Farmart.\n"
        "The Farmart Team"
    )
    html_body = (
        f"<p>Dear {escape(name)},</p>"
        f"<p>We are pleased to inform you that a payment has been received "
        f"for your order <strong>#{order_ref}</strong>.</p>"
        f"<ul>"
        f"<li><strong>Order ID:</strong> {order_ref}</li>"
        f"<li><strong>Amount:</strong> {amount}</li>"
        f"<li><strong>M-Pesa Receipt:</strong> {receipt}</li>"
        f"</ul>"
        f"<p>The buyer has been notified. Please prepare the livestock for "
        f"delivery as agreed.</p>"
        f"<p>Thank you for selling on Farmart.<br>The Farmart Team</p>"
    )
    return _send_safe(subject, farmer_user.email, body, html_body)


def send_buyer_transaction_email(buyer_user, transaction, order=None):
    """Send a buyer a receipt after a successful M-Pesa transaction."""
    if not buyer_user or not buyer_user.email:
        logger.warning("Buyer email skipped: no email address")
        return False

    amount = _format_amount(transaction.amount)
    receipt = transaction.receipt_number or transaction.checkout_request_id
    order_ref = order.id if order else transaction.order_id
    name = buyer_user.full_name or "Customer"
    subject = f"Farmart: Payment received for Order #{order_ref}"
    body = (
        f"Dear {name},\n\n"
        f"We have received your payment for order #{order_ref}.\n\n"
        f"Order ID: {order_ref}\n"
        f"Amount: {amount}\n"
        f"M-Pesa Receipt: {receipt}\n\n"
        "The farmer has been notified and will prepare your livestock for "
        "delivery as agreed.\n\n"
        "Thank you for using Farmart.\n"
        "The Farmart Team"
    )
    html_body = (
        f"<p>Dear {escape(name)},</p>"
        f"<p>We have received your payment for order "
        f"<strong>#{order_ref}</strong>.</p>"
        "<ul>"
        f"<li><strong>Order ID:</strong> {order_ref}</li>"
        f"<li><strong>Amount:</strong> {escape(amount)}</li>"
        f"<li><strong>M-Pesa Receipt:</strong> {escape(str(receipt))}</li>"
        "</ul>"
        "<p>The farmer has been notified and will prepare your livestock for "
        "delivery as agreed.</p>"
        "<p>Thank you for using Farmart.<br>The Farmart Team</p>"
    )
    return _send_safe(subject, buyer_user.email, body, html_body)
