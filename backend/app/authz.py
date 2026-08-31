from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from app.models.farmer import Farmer

def authenticated(view):
    @wraps(view)
    @jwt_required()
    def wrapped(*args, **kwargs):
        if not get_jwt_identity():
            return jsonify({"error": "Authentication required"}), 401
        return view(*args, **kwargs)
    return wrapped

def require_role(*roles):
    def decorator(view):
        @wraps(view)
        @jwt_required()
        def wrapped(*args, **kwargs):
            if not get_jwt_identity():
                return jsonify({"error": "Authentication required"}), 401
            user_role = (get_jwt().get("role") or "").upper()
            allowed_roles = {role.upper() for role in roles}
            if user_role not in allowed_roles:
                return jsonify({"error": "You do not have permission"}), 403
            return view(*args, **kwargs)
        return wrapped
    return decorator

def current_user_id():
    return int(get_jwt_identity())


def owns_user(resource_user_id):
    return int(resource_user_id) == current_user_id()


def current_farmer():
    """Return the farmer profile belonging to the authenticated user."""
    return Farmer.query.filter_by(user_id=current_user_id()).first()
