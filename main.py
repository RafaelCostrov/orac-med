from flask import Flask, render_template
from flask_cors import CORS
from routes.exame_routes import exame_bp
from routes.cliente_routes import cliente_bp
from routes.usuario_routes import usuario_bp
from routes.atendimento_routes import atendimento_bp

app = Flask(__name__)
CORS(app, origins=["http://orac:5000"])

app.register_blueprint(exame_bp)
app.register_blueprint(cliente_bp)
app.register_blueprint(usuario_bp)
app.register_blueprint(atendimento_bp)


@app.route("/")
def atendimento():
    return render_template("atendimento.html")


@app.route("/relatorio")
def relatorio():
    return render_template("relatorio.html")


@app.route("/conta")
def conta():
    return render_template("conta.html")


@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/redefinir")
def redefinir():
    return render_template("redefinir.html")


@app.route("/cadastro")
def cadastro():
    return render_template("cadastro.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
