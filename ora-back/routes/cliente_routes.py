from flask import Blueprint, request, jsonify
from services.cliente_service import ClienteService
from model.cliente import Cliente
from db.db import Session

cliente_bp = Blueprint('cliente', __name__, url_prefix='/clientes')

service = ClienteService()


@cliente_bp.route('/cadastrar-cliente', methods=['POST'])
def cadastrar_cliente():
    try:
        data = request.get_json()
        nome_cliente = data.get('nome_cliente')
        cnpj_cliente = data.get('cnpj_cliente')
        tipo_cliente = data.get('tipo_cliente')
        exames_incluidos = data.get('exames_incluidos')

        service.cadastrar_cliente(
            nome_cliente=nome_cliente,
            cnpj_cliente=cnpj_cliente,
            tipo_cliente=tipo_cliente,
            exames_incluidos=exames_incluidos
        )
        Session.remove()
        return jsonify({
            "mensagem": f"Cliente cadastrado!"
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        Session.remove()
        return jsonify({
            "erro": "Ocorreu um erro! Tente novamente"
        }), 400


@cliente_bp.route('/listar-clientes')
def listar_todos_clientes():
    try:
        clientes = service.listar_todos_clientes()
        Session.remove()
        return jsonify({
            "mensagem": "Clientes listados com sucesso!",
            "clientes": clientes
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        Session.remove()
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@cliente_bp.route('/filtrar-clientes')
def filtrar_clientes():
    try:
        data = request.get_json()
        id_cliente = data.get('id_cliente')
        nome_cliente = data.get('nome_cliente')
        cnpj_cliente = data.get('cnpj_cliente')
        tipo_cliente = data.get('tipo_cliente')
        exames_incluidos = data.get('exames_incluidos')

        clientes_filtrados = service.filtrar_clientes(
            id_cliente=id_cliente,
            nome_cliente=nome_cliente,
            cnpj_cliente=cnpj_cliente,
            tipo_cliente=tipo_cliente,
            exames_incluidos=exames_incluidos
        )

        Session.remove()
        return jsonify({
            "mensagem": "Clientes filtrados com sucesso!",
            "clientes": clientes_filtrados
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        Session.remove()
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@cliente_bp.route('/remover-cliente', methods=['DELETE'])
def remover_cliente():
    try:
        data = request.get_json()
        id_cliente = data.get('id_cliente')

        service.remover_cliente(id_cliente=id_cliente)
        Session.remove()
        return ({
            "mensagem": "Cliente removido com sucesso!"
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        Session.remove()
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@cliente_bp.route('/atualizar-cliente', methods=['PUT'])
def atualizar_cliente():
    try:
        data = request.get_json()
        id_cliente = data.get('id_cliente')
        nome_cliente = data.get('nome_cliente')
        cnpj_cliente = data.get('cnpj_cliente')
        tipo_cliente = data.get('tipo_cliente')
        exames_incluidos = data.get('exames_incluidos')

        exame_atualizado = service.atualizar_cliente(
            id_cliente=id_cliente,
            nome_cliente=nome_cliente,
            cnpj_cliente=cnpj_cliente,
            tipo_cliente=tipo_cliente,
            exames_incluidos=exames_incluidos
        )
        Session.remove()
        return ({
            "mensagem": "Exame atualizado com sucesso!",
            "cliente": exame_atualizado
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        Session.remove()
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400
