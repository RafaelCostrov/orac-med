from flask import Blueprint, request, jsonify
from services.exame_service import ExameService
from model.exame import Exame
from db.db import Session

exame_bp = Blueprint('exame', __name__, url_prefix="/exames")

service = ExameService()


@exame_bp.route('/cadastrar-exame', methods=['POST'])
def cadastrar_exame():
    try:
        data = request.get_json()
        nome_exame = data.get('nome_exame')
        is_interno = data.get('is_interno')
        valor_exame = float(data.get('valor_exame'))

        novo_exame = Exame(
            nome_exame=nome_exame,
            is_interno=is_interno,
            valor_exame=valor_exame
        )

        service.cadastrar_exame(novo_exame)
        return jsonify({
            "mensagem": f"Exame cadastrado!"
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro! Tente novamente"
        }), 400


@exame_bp.route('/listar-exames')
def listar_todos_exames():
    try:
        exames = service.listar_todos_exames()
        return jsonify({
            "mensagem": "Exames listadas com sucesso!",
            "exames": exames
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@exame_bp.route('/filtrar-exames', methods=['POST'])
def filtrar_exame():
    try:
        data = request.get_json()
        id_exame = data.get('id_exame')
        nome_exame = data.get('nome_exame')
        is_interno = data.get('is_interno')
        min_valor = data.get('min_valor')
        max_valor = data.get('max_valor')
        pagina = data.get('pagina', 1)
        por_pagina = data.get('por_pagina', 20)
        order_by = data.get('order_by')
        order_dir = data.get('order_dir')

        exames_filtrados = service.filtrar_exames(
            id_exame=id_exame,
            nome_exame=nome_exame,
            is_interno=is_interno,
            min_valor=min_valor,
            max_valor=max_valor,
            pagina=pagina,
            por_pagina=por_pagina,
            order_by=order_by,
            order_dir=order_dir
        )
        return jsonify({
            "mensagem": "Exames filtradas com sucesso!",
            **exames_filtrados
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@exame_bp.route('/remover-exame', methods=['DELETE'])
def remover_exame():
    try:
        data = request.get_json()
        id_exame = data.get('id_exame')

        service.remover_exame(id_exame=id_exame)
        return ({
            "mensagem": "Exame removido com sucesso!"
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@exame_bp.route('/atualizar-exame', methods=['PUT'])
def atualizar_exame():
    try:
        data = request.get_json()
        id_exame = data.get('id_exame')
        nome_exame = data.get('nome_exame')
        is_interno = data.get('is_interno')
        valor_exame = data.get('valor_exame')
        exame_atualizado = service.atualizar_exame(
            id_exame=id_exame,
            nome_exame=nome_exame,
            is_interno=is_interno,
            valor_exame=valor_exame
        )
        return ({
            "mensagem": "Exame atualizado com sucesso!",
            "exame_atualizado": exame_atualizado
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400
