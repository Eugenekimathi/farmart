from flask_mail import Message


def send_receipt_email(mail, transaction):
    """Send a payment receipt confirmation email for a successful transaction."""
    if not transaction.email:
        return

    subject = "Payment Receipt Confirmation"
    body = (
        f"Dear {transaction.name},\n\n"
        f"Thank you for your payment of {transaction.amount}.\n"
        f"Your MPESA confirmation receipt is {transaction.mpesa_receipt_number}.\n\n"
        "Best Regards,\nSTK PUSH"
    )
    html_body = (
        f"<p>Dear {transaction.name},</p>"
        f"<p>Thank you for your payment of {transaction.amount}</p>"
        f"<p>Your MPESA confirmation receipt is {transaction.mpesa_receipt_number}</p>"
        f"<p>Best Regards, STK Push</p>"
    )

    msg = Message(subject=subject, recipients=[transaction.email], body=body, html=html_body)
    mail.send(msg)