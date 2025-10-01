from flask import jsonify, session, redirect, url_for
from functools import wraps


def role_required(*roles):
    def wrapper(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            usuario = session.get("usuario")
            if not usuario or usuario.get("role") not in roles:
                return jsonify({"erro": "Acesso negado!"}), 403
            return f(*args, **kwargs)
        return decorated_function
    return wrapper


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "usuario" not in session:
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function
