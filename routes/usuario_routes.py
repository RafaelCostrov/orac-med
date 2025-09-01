from flask import Blueprint, request, jsonify, session, send_file
from services.usuario_service import UsuarioService
from datetime import datetime

usuario_bp = Blueprint('usuario', __name__, url_prefix="/usuarios")

service = UsuarioService()


@usuario_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email_usuario = data.get('email_usuario')
        senha = data.get('senha')
        usuario = service.verificar_usuario(
            email_usuario=email_usuario, senha=senha)
        if usuario:
            session['usuario'] = {
                "id_usuario": usuario.id_usuario,
                "nome_usuario": usuario.nome_usuario,
                "email_usuario": usuario.email_usuario,
                "role": usuario.role.__str__(),
                "foto_url": usuario.foto_url if usuario.foto_url else None
            }
            return jsonify({
                "mensagem": "Usuário autenticado com sucesso!",
                "usuario": session['usuario']
            }), 200
        else:
            return jsonify({
                "erro": "Email ou senha inválidos!"
            }), 401
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@usuario_bp.route('/resetar-senha', methods=['POST'])
def resetar_senha():
    try:
        data = request.get_json()
        print(data)
        email_usuario = data.get('email_usuario')
        email_enviado = service.resetar_senha(
            email_usuario=email_usuario
        )
        return jsonify({
            "mensagem": f"Nova senha enviada no email '{email_enviado}'"
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@usuario_bp.route('/logout', methods=['POST'])
def logout():
    try:
        session.pop('usuario', None)
        return jsonify({
            "mensagem": "Usuário deslogado com sucesso!"
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@usuario_bp.route('/cadastrar-usuario', methods=['POST'])
def cadastrar_usuario():
    try:
        data = request.form
        nome_usuario = data.get('nome_usuario')
        email_usuario = data.get('email_usuario')
        senha = data.get('senha')
        role = data.get('role')
        foto = request.files.get('foto')

        novo_usuario = service.cadastrar_usuario(
            nome_usuario=nome_usuario,
            email_usuario=email_usuario,
            role=role,
            senha=senha,
            foto=foto if foto else None
        )

        return jsonify({
            "mensagem": f"Usuário cadastrado!",
            **novo_usuario
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
        data = request.form
        id_usuario = data.get('id_usuario')
        nome_usuario = data.get('nome_usuario')
        email_usuario = data.get('email_usuario')
        senha = data.get('senha')
        role = data.get('role')
        foto = request.files.get('foto')
        role = data.get('role')

        usuario_atualizado = service.atualizar_usuario(
            id_usuario=id_usuario,
            nome_usuario=nome_usuario,
            email_usuario=email_usuario,
            senha=senha,
            role=role,
            foto=foto if foto else None
        )
        # session["usuario"] = usuario_atualizado

        return ({
            "mensagem": "Usuário atualizado com sucesso!",
            **usuario_atualizado
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@usuario_bp.route('/atualizar-conta', methods=['PUT'])
def atualizar_conta():
    try:
        data = request.form
        id_usuario = data.get('id_usuario')
        nome_usuario = data.get('nome_usuario')
        email_usuario = data.get('email_usuario')
        senha = data.get('senha')
        role = data.get('role')
        foto = request.files.get('foto')
        role = data.get('role')

        usuario_atualizado = service.atualizar_usuario(
            id_usuario=id_usuario,
            nome_usuario=nome_usuario,
            email_usuario=email_usuario,
            senha=senha,
            role=role,
            foto=foto if foto else None
        )
        session["usuario"] = usuario_atualizado

        return ({
            "mensagem": "Conta com sucesso!",
            **usuario_atualizado
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@usuario_bp.route('/exportar-usuarios-xls', methods=['POST'])
def exportar_excel():
    try:
        data = request.get_json()
        id_usuario = data.get('id_usuario')
        nome_usuario = data.get('nome_usuario')
        email_usuario = data.get('email_usuario')
        role = data.get('role')

        arquivo = service.exportar_excel(
            id_usuario=id_usuario,
            nome_usuario=nome_usuario,
            email_usuario=email_usuario,
            role=role,
        )

        agora = datetime.now()
        hora = agora.strftime("%H-%M-%S")
        nome_excel = f"Usuarios_{hora}.xlsx"

        return send_file(
            arquivo,
            download_name=nome_excel,
            as_attachment=True,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@usuario_bp.route('/exportar-usuarios-txt', methods=['POST'])
def exportar_txt():
    try:
        data = request.get_json()
        id_usuario = data.get('id_usuario')
        nome_usuario = data.get('nome_usuario')
        email_usuario = data.get('email_usuario')
        role = data.get('role')

        arquivo = service.exportar_txt(
            id_usuario=id_usuario,
            nome_usuario=nome_usuario,
            email_usuario=email_usuario,
            role=role,
        )

        agora = datetime.now()
        hora = agora.strftime("%H-%M-%S")
        nome_txt = f"Usuarios_{hora}.txt"

        return send_file(
            arquivo,
            download_name=nome_txt,
            as_attachment=True,
            mimetype="text/plain"
        )

    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400
