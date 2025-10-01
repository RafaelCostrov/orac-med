from flask import Flask, jsonify, render_template, session, redirect, url_for
from functools import wraps
from flask_cors import CORS
from routes.exame_routes import exame_bp
from routes.cliente_routes import cliente_bp
from routes.usuario_routes import usuario_bp
from routes.atendimento_routes import atendimento_bp
from auxiliar.auxiliar import role_required, login_required

app = Flask(__name__)
app.secret_key = "segredo"
CORS(app, origins=["http://orac:5000"])

app.register_blueprint(exame_bp)
app.register_blueprint(cliente_bp)
app.register_blueprint(usuario_bp)
app.register_blueprint(atendimento_bp)


@app.route("/")
def login():
    return render_template("login.html")


@app.route("/redefinir")
def redefinir():
    return render_template("redefinir.html")


@app.route("/atendimento")
@login_required
def atendimento():
    usuario = session.get('usuario')
    id = usuario.get('foto_url', '')
    link = f"https://lh3.googleusercontent.com/d/{id}" if id else ''
    return render_template("atendimento.html", id_usuario=usuario['id_usuario'], username=usuario['nome_usuario'],
                           email=usuario['email_usuario'], role=usuario['role'], link=link)


@app.route("/relatorio")
@login_required
def relatorio():
    usuario = session.get('usuario')
    id = usuario.get('foto_url', '')
    link = f"https://lh3.googleusercontent.com/d/{id}" if id else ''
    return render_template("relatorio.html", id_usuario=usuario['id_usuario'], username=usuario['nome_usuario'], email=usuario['email_usuario'], role=usuario['role'],
                           link=link)


@app.route("/conta")
@login_required
def conta():
    usuario = session.get('usuario')
    id = usuario.get('foto_url', '')
    link = f"https://lh3.googleusercontent.com/d/{id}" if id else ''
    return render_template("conta.html", id_usuario=usuario['id_usuario'], username=usuario['nome_usuario'], email=usuario['email_usuario'], role=usuario['role'],
                           link=link)


@app.route("/cadastro")
@login_required
def cadastro():
    usuario = session.get('usuario')
    id = usuario.get('foto_url', '')
    link = f"https://lh3.googleusercontent.com/d/{id}" if id else ''
    return render_template("cadastro.html", id_usuario=usuario['id_usuario'], username=usuario['nome_usuario'], email=usuario['email_usuario'], role=usuario['role'],
                           link=link)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)
