from flask import Flask
from flask_cors import CORS
from routes.exame_routes import exame_bp
from routes.cliente_routes import cliente_bp
from routes.usuario_routes import usuario_bp
from routes.atendimento_routes import atendimento_bp

app = Flask(__name__)
CORS(app)  # TODO filtrar isso daqui

app.register_blueprint(exame_bp)
app.register_blueprint(cliente_bp)
app.register_blueprint(usuario_bp)
app.register_blueprint(atendimento_bp)


if __name__ == "__main__":
    app.run()
