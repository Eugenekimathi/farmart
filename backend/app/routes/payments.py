from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from app.extensions import db
from app.authz import authenticated
from app.models.payment import Payment
from app.models.order import Order
from app.schemas.payment_schema import (
    PaymentSchema,
    PaymentResponseSchema
)
from app.services.mpesa_service import mpesa_service

payment_bp = Blueprint(
    "payments",
    __name__,
    url_prefix="/api/payments"
)

schema = PaymentSchema()
response_schema = PaymentResponseSchema()
many_response_schema = PaymentResponseSchema(many=True)

@payment_bp.route("/stkpush", methods=["POST"])
@authenticated
def initiate_stk_push():
    """Initiate M-Pesa STK Push payment"""
    data = request.get_json()

    order_id = data.get("order_id")
    phone_number = data.get("phone_number")

    if not order_id or not phone_number:
        return jsonify({
            "error": "order_id and phone_number are required"
        }), 400

    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    # Format phone number
    formatted_phone = mpesa_service.format_phone_number(phone_number)

    # Initiate STK Push
    result = mpesa_service.initiate_stk_push(
        phone_number=formatted_phone,
        amount=float(order.total_amount),
        account_reference=f"Order-{order.id}",
        transaction_desc=f"Payment for Order {order.id}"
    )

    if result.get('success'):
        return jsonify({
            "message": "STK Push initiated successfully",
            "data": result.get('data')
        }), 200
    else:
        return jsonify({
            "error": result.get('message'),
            "details": result.get('error')
        }), 400

@payment_bp.route("/callback", methods=["POST"])
def mpesa_callback():
    """Handle M-Pesa payment callback"""
    try:
        data = request.get_json()
        # Process callback and update payment status
        # This would parse the M-Pesa callback response
        # and update the payment record accordingly
        return jsonify({"message": "Callback received"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@payment_bp.route("", methods=["POST"])
@authenticated
def create_payment():

    try:
        data = schema.load(
            request.get_json()
        )

    except ValidationError as err:
        return jsonify({
            "errors": err.messages
        }), 400

    order = db.session.get(
        Order,
        data["order_id"]
    )

    if not order:
        return jsonify({
            "error": "Order not found"
        }), 404

    if float(data["amount"]) != float(
        order.total_amount
    ):
        return jsonify({
            "error": "Payment amount does not match order total"
        }), 400

    existing_payment = Payment.query.filter_by(
        order_id=data["order_id"]
    ).first()

    if existing_payment:
        return jsonify({
            "error": "Payment already exists for this order"
        }), 409

    payment = Payment(**data)

    db.session.add(payment)
    db.session.commit()

    return jsonify(
        response_schema.dump(payment)
    ), 201


@payment_bp.route("", methods=["GET"])
@authenticated
def get_payments():

    payments = Payment.query.all()

    return jsonify(
        many_response_schema.dump(payments)
    ), 200


@payment_bp.route("/<int:payment_id>", methods=["GET"])
@authenticated
def get_payment(payment_id):

    payment = db.session.get(
        Payment,
        payment_id
    )

    if not payment:
        return jsonify({
            "error": "Payment not found"
        }), 404

    return jsonify(
        response_schema.dump(payment)
    ), 200

@payment_bp.route(
    "/<int:payment_id>/status",
    methods=["PATCH"]
)
@authenticated
def update_payment_status(payment_id):

    payment = db.session.get(
        Payment,
        payment_id
    )

    if not payment:
        return jsonify({
            "error": "Payment not found"
        }), 404

    data = request.get_json()

    status = data.get("status")

    allowed_statuses = [
        "PENDING",
        "SUCCESS",
        "FAILED",
        "CANCELLED"
    ]

    if status not in allowed_statuses:
        return jsonify({
            "error": "Invalid payment status"
        }), 400

    payment.status = status

    db.session.commit()

    return jsonify(
        response_schema.dump(payment)
    ), 200