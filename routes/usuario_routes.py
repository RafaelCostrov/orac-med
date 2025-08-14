from flask import Blueprint, request, jsonify
from services.usuario_service import UsuarioService
from model.usuario import Usuario
from db.db import Session

usuario_bp = Blueprint('usuario', __name__, url_prefix="/usuarios")

service = UsuarioService()


@usuario_bp.route('/cadastrar-usuario', methods=['POST'])
def cadastrar_usuario():
    try:
        data = request.get_json()
        nome_usuario = data.get('nome_usuario')
        email_usuario = data.get('email_usuario')
        senha = data.get('senha')
        role = data.get('role')

        novo_usuario = Usuario(  # TODO Fazer autenticacao no service.
            nome_usuario=nome_usuario,
            email_usuario=email_usuario,
            senha=senha,
            role=role,
        )
        service.cadastrar_usuario(novo_usuario)
        return jsonify({
            "mensagem": f"Usuário cadastrado!"
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro! Tente novamente"
        }), 400


@usuario_bp.route('/listar-usuarios')
def listar_todos_usuarios():
    try:
        usuarios = service.listar_todos_usuarios()
        return jsonify({
            "mensagem": "Usuários listadas com sucesso!",
            "usuarios": usuarios
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@usuario_bp.route('/filtrar-usuarios', methods=['POST'])
def filtrar_usuario():
    try:
        data = request.get_json()
        id_usuario = data.get('id_usuario')
        nome_usuario = data.get('nome_usuario')
        email_usuario = data.get('email_usuario')
        role = data.get('role')
        pagina = data.get('pagina', 1)
        por_pagina = data.get('por_pagina', 20)
        order_by = data.get('order_by')
        order_dir = data.get('order_dir')

        usuarios_filtrados = service.filtrar_usuarios(
            id_usuario=id_usuario,
            nome_usuario=nome_usuario,
            email_usuario=email_usuario,
            role=role,
            pagina=pagina,
            por_pagina=por_pagina,
            order_by=order_by,
            order_dir=order_dir
        )
        return jsonify({
            "mensagem": "Usuários filtradas com sucesso!",
            **usuarios_filtrados
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@usuario_bp.route('/remover-usuario', methods=['DELETE'])
def remover_usuario():
    try:
        data = request.get_json()
        id_usuario = data.get('id_usuario')
        service.remover_usuario(id_usuario=id_usuario)
        return ({
            "mensagem": "Usuario removido com sucesso!"
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@usuario_bp.route('/atualizar-usuario', methods=['PUT'])
def atualizar_usuario():
    try:
        data = request.get_json()
        id_usuario = data.get('id_usuario')
        nome_usuario = data.get('nome_usuario')
        email_usuario = data.get('email_usuario')
        role = data.get('role')
        usuario_atualizado = service.atualizar_usuario(
            id_usuario=id_usuario,
            nome_usuario=nome_usuario,
            email_usuario=email_usuario,
            role=role,
        )
        return ({
            "mensagem": "Usuário atualizado com sucesso!",
            "usuario_atualizado": usuario_atualizado
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400
