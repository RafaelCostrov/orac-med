from flask import Flask
from routes.exame_routes import exame_bp
from routes.cliente_routes import cliente_bp
from routes.usuario_routes import usuario_bp

app = Flask(__name__)
app.register_blueprint(exame_bp)
app.register_blueprint(cliente_bp)
app.register_blueprint(usuario_bp)


if __name__ == "__main__":
    app.run()
