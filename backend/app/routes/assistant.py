from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.schemas.assistant_schema import AssistantChatSchema
from app.services.assistant_service import respond


assistant_bp = Blueprint("assistant", __name__, url_prefix="/api/assistant")
schema = AssistantChatSchema()


@assistant_bp.route("/chat", methods=["POST"])
def chat():
    try:
        data = schema.load(request.get_json(silent=True) or {})
    except ValidationError as error:
        return jsonify({"error": "Invalid assistant request", "details": error.messages}), 400
    result = respond(data["message"].strip(), data.get("conversation_id"))
    return jsonify({"success": True, **result}), 200
