from flask import Flask
from routes.exame_routes import service_bp

app = Flask(__name__)
app.register_blueprint(service_bp)


if __name__ == "__main__":
    app.run()
