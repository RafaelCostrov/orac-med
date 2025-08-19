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
        return jsonify({
            "mensagem": f"Cliente cadastrado!"
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro! Tente novamente"
        }), 400


@cliente_bp.route('/listar-clientes')
def listar_todos_clientes():
    try:
        clientes = service.listar_todos_clientes()
        return jsonify({
            "mensagem": "Clientes listados com sucesso!",
            "clientes": clientes
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@cliente_bp.route('/filtrar-clientes', methods=['POST'])
def filtrar_clientes():
    try:
        data = request.get_json()
        id_cliente = data.get('id_cliente')
        nome_cliente = data.get('nome_cliente')
        cnpj_cliente = data.get('cnpj_cliente')
        tipo_cliente = data.get('tipo_cliente')
        exames_incluidos = data.get('exames_incluidos')
        pagina = data.get('pagina', 1)
        por_pagina = data.get('por_pagina', 20)
        order_by = data.get('order_by')
        order_dir = data.get('order_dir')

        clientes_filtrados = service.filtrar_clientes(
            id_cliente=id_cliente,
            nome_cliente=nome_cliente,
            cnpj_cliente=cnpj_cliente,
            tipo_cliente=tipo_cliente,
            exames_incluidos=exames_incluidos,
            pagina=pagina,
            por_pagina=por_pagina,
            order_by=order_by,
            order_dir=order_dir
        )

        return jsonify({
            "mensagem": "Clientes filtrados com sucesso!",
            **clientes_filtrados
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@cliente_bp.route('/remover-cliente', methods=['DELETE'])
def remover_cliente():
    try:
        data = request.get_json()
        id_cliente = data.get('id_cliente')

        service.remover_cliente(id_cliente=id_cliente)
        return jsonify({
            "mensagem": "Cliente removido com sucesso!"
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
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

        atendimento_atualizado = service.atualizar_cliente(
            id_cliente=id_cliente,
            nome_cliente=nome_cliente,
            cnpj_cliente=cnpj_cliente,
            tipo_cliente=tipo_cliente,
            exames_incluidos=exames_incluidos
        )
        return jsonify({
            "mensagem": "Atendimento atualizado com sucesso!",
            "cliente": atendimento_atualizado
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@cliente_bp.route('/buscar-cnpj', methods=['POST'])
def buscar_cnpj():
    try:
        data = request.get_json()
        cnpj = data.get('cnpj')

        nome = service.buscar_cnpj(
            cnpj=cnpj
        )

        return ({
                "nome": nome
                }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400
