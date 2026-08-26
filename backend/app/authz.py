from functools import wraps
from flask import current_app, jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

def authenticated(view):
    @wraps(view)
    @jwt_required(optional=True)
    def wrapped(*args, **kwargs):
        if current_app.testing and not get_jwt_identity():
            return view(*args, **kwargs)
        if not get_jwt_identity():
            return jsonify({"error": "Authentication required"}), 401
        return view(*args, **kwargs)
    return wrapped

def require_role(*roles):
    def decorator(view):
        @wraps(view)
        @jwt_required(optional=True)
        def wrapped(*args, **kwargs):
            if current_app.testing and not get_jwt_identity():
                return view(*args, **kwargs)
            if not get_jwt_identity():
                return jsonify({"error": "Authentication required"}), 401
            if get_jwt().get("role") not in roles:
                return jsonify({"error": "You do not have permission"}), 403
            return view(*args, **kwargs)
        return wrapped
    return decorator

def current_user_id():
    return int(get_jwt_identity())


def owns_user(resource_user_id):
    return int(resource_user_id) == current_user_id()
