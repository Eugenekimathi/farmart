from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt
from marshmallow import ValidationError

from app.extensions import db
from app.authz import authenticated, current_user_id
from app.models.payment import Payment
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.farmer import Farmer
from app.models.transaction import Transaction
from app.schemas.payment_schema import (
    PaymentSchema,
    PaymentResponseSchema
)
from app.schemas.transaction_schema import (
    TransactionResponseSchema
)
from app.services.mpesa_service import (
    mpesa_service,
    MpesaError,
)

payment_bp = Blueprint(
    "payments",
    __name__,
    url_prefix="/api/payments"
)

schema = PaymentSchema()
response_schema = PaymentResponseSchema()
many_response_schema = PaymentResponseSchema(many=True)
transaction_response_schema = TransactionResponseSchema()
many_transaction_response_schema = TransactionResponseSchema(many=True)


@payment_bp.route("/stkpush", methods=["POST"])
@authenticated
def initiate_stk_push():
    """Initiate M-Pesa STK Push payment"""
    data = request.get_json(silent=True) or {}

    order_id = data.get("order_id")
    phone_number = data.get("phone_number")

    if not order_id or not phone_number:
        return jsonify({
            "error": "order_id and phone_number are required"
        }), 400

    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    if order.buyer_id != current_user_id():
        return jsonify({"error": "You can only pay for your own orders"}), 403

    # Format phone number
    formatted_phone = mpesa_service.format_phone_number(phone_number)

    # Initiate STK Push
    result = mpesa_service.initiate_stk_push(
        phone_number=formatted_phone,
        amount=float(order.total_amount),
        account_reference=f"Order-{order.id}",
        transaction_desc=f"Payment for Order {order.id}"
    )

    if not result.get("success"):
        return jsonify({
            "error": result.get("message", "Payment initiation failed"),
            "details": result.get("error")
        }), 502

    stk_data = result.get("data", {})
    checkout_request_id = stk_data.get("CheckoutRequestID")
    merchant_request_id = stk_data.get("MerchantRequestID")

    # Persist the transaction for idempotent callback handling.
    if checkout_request_id:
        existing = Transaction.query.filter_by(
            checkout_request_id=checkout_request_id
        ).first()
        if not existing:
            transaction = Transaction(
                order_id=order.id,
                checkout_request_id=checkout_request_id,
                merchant_request_id=merchant_request_id,
                phone_number=formatted_phone,
                amount=order.total_amount,
                status="PENDING",
            )
            db.session.add(transaction)
            db.session.commit()
        else:
            transaction = existing
    else:
        transaction = None

    return jsonify({
        "message": "STK Push initiated successfully. Confirm the prompt on your phone.",
        "checkout_request_id": checkout_request_id,
        "merchant_request_id": merchant_request_id,
        "transaction": transaction_response_schema.dump(transaction) if transaction else None,
    }), 200


@payment_bp.route("/callback", methods=["POST"])
def mpesa_callback():
    """Handle M-Pesa payment callback (idempotent)."""
    payload = request.get_json(silent=True) or {}

    if not payload or "Body" not in payload:
        return jsonify({"error": "Invalid callback payload"}), 400

    try:
        transaction = mpesa_service.process_callback(payload)
    except MpesaError as exc:
        # Daraja expects a 200 response even for unknown requests to stop retries,
        # but we log the error so operators can investigate.
        return jsonify({"ResultCode": 1, "ResultDesc": str(exc)}), 200
    except Exception:
        return jsonify({"ResultCode": 1, "ResultDesc": "Internal error"}), 500

    return jsonify({
        "ResultCode": 0,
        "ResultDesc": "Success",
        "transaction": transaction_response_schema.dump(transaction),
    }), 200


@payment_bp.route("/transactions", methods=["GET"])
@authenticated
def get_transactions():
    """Retrieve transactions for the current user's orders."""
    role = (get_jwt().get("role") or "").upper()
    query = Transaction.query.join(Order)

    if role == "FARMER":
        farmer = Farmer.query.filter_by(user_id=current_user_id()).first()
        if not farmer:
            return jsonify({"transactions": []}), 200
        query = query.join(OrderItem).filter(OrderItem.farmer_id == farmer.id).distinct()
    else:
        query = query.filter(Order.buyer_id == current_user_id())

    transactions = query.order_by(Transaction.created_at.desc()).all()
    return jsonify({
        "transactions": many_transaction_response_schema.dump(transactions)
    }), 200


@payment_bp.route("/transactions/<int:transaction_id>", methods=["GET"])
@authenticated
def get_transaction(transaction_id):
    """Retrieve a single transaction if it belongs to the current user."""
    transaction = db.session.get(Transaction, transaction_id)
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404

    order = transaction.order
    role = (get_jwt().get("role") or "").upper()

    if role == "FARMER":
        farmer = Farmer.query.filter_by(user_id=current_user_id()).first()
        if not farmer or not any(item.farmer_id == farmer.id for item in order.order_items):
            return jsonify({"error": "You can only view transactions for your orders"}), 403
    elif order.buyer_id != current_user_id():
        return jsonify({"error": "You can only view your own transactions"}), 403

    return jsonify(transaction_response_schema.dump(transaction)), 200


@payment_bp.route("/status/<checkout_request_id>", methods=["GET"])
@authenticated
def get_transaction_status(checkout_request_id):
    """Retrieve transaction status by CheckoutRequestID."""
    transaction = Transaction.query.filter_by(
        checkout_request_id=checkout_request_id
    ).first()

    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404

    order = transaction.order
    role = (get_jwt().get("role") or "").upper()

    if role == "FARMER":
        farmer = Farmer.query.filter_by(user_id=current_user_id()).first()
        if not farmer or not any(item.farmer_id == farmer.id for item in order.order_items):
            return jsonify({"error": "You can only view transactions for your orders"}), 403
    elif order.buyer_id != current_user_id():
        return jsonify({"error": "You can only view your own transactions"}), 403

    return jsonify(transaction_response_schema.dump(transaction)), 200


@payment_bp.route("", methods=["POST"])
@authenticated
def create_payment():
    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    order = db.session.get(Order, data["order_id"])

    if not order:
        return jsonify({"error": "Order not found"}), 404
    if order.buyer_id != current_user_id():
        return jsonify({"error": "You can only pay for your own orders"}), 403
    if float(data["amount"]) != float(order.total_amount):
        return jsonify({"error": "Payment amount does not match order total"}), 400

    existing_payment = Payment.query.filter_by(order_id=data["order_id"]).first()
    if existing_payment:
        return jsonify({"error": "Payment already exists for this order"}), 409

    payment = Payment(**data)
    db.session.add(payment)
    db.session.commit()

    return jsonify(response_schema.dump(payment)), 201


@payment_bp.route("", methods=["GET"])
@authenticated
def get_payments():
    role = (get_jwt().get("role") or "").upper()
    if role == "FARMER":
        farmer = Farmer.query.filter_by(user_id=current_user_id()).first()
        payments = Payment.query.join(Order).join(OrderItem).filter(OrderItem.farmer_id == farmer.id).all() if farmer else []
    else:
        payments = Payment.query.join(Order).filter(Order.buyer_id == current_user_id()).all()

    return jsonify(many_response_schema.dump(payments)), 200


@payment_bp.route("/<int:payment_id>", methods=["GET"])
@authenticated
def get_payment(payment_id):
    payment = db.session.get(Payment, payment_id)

    if not payment:
        return jsonify({"error": "Payment not found"}), 404
    if payment.order.buyer_id != current_user_id():
        return jsonify({"error": "You can only view your own payments"}), 403
    return jsonify(response_schema.dump(payment)), 200


@payment_bp.route("/<int:payment_id>/status", methods=["PATCH"])
@authenticated
def update_payment_status(payment_id):
    payment = db.session.get(Payment, payment_id)

    if not payment:
        return jsonify({"error": "Payment not found"}), 404
    if payment.order.buyer_id != current_user_id():
        return jsonify({"error": "You can only update your own payments"}), 403
    data = request.get_json(silent=True) or {}

    status = data.get("status")

    allowed_statuses = ["PENDING", "SUCCESS", "FAILED", "CANCELLED"]
    if status not in allowed_statuses:
        return jsonify({"error": "Invalid payment status"}), 400

    payment.status = status
    db.session.commit()

    return jsonify(response_schema.dump(payment)), 200