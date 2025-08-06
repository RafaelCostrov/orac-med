from flask import Blueprint, request, jsonify
from services.atendimento_service import AtendimentoService
from model.atendimento import Atendimento
from db.db import Session

atendimento_bp = Blueprint('atendimento', __name__, url_prefix='/atendimentos')

service = AtendimentoService()


@atendimento_bp.route('/cadastrar-atendimento', methods=['POST'])
def cadastrar_atendimento():
    try:
        data = request.get_json()
        tipo_atendimento = data.get('tipo_atendimento')
        usuario = data.get('usuario')
        valor = data.get('valor')
        colaborador_atendimento = data.get('colaborador_atendimento')
        id_cliente = data.get('id_cliente')
        ids_exames = data.get('ids_exames')

        service.cadastrar_atendimento(
            tipo_atendimento=tipo_atendimento,
            usuario=usuario,
            valor=valor,
            colaborador_atendimento=colaborador_atendimento,
            id_cliente=id_cliente,
            ids_exames=ids_exames
        )
        Session.remove()
        return jsonify({
            "mensagem": f"Atendimento cadastrado!"
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        Session.remove()
        return jsonify({
            "erro": "Ocorreu um erro! Tente novamente"
        }), 400


@atendimento_bp.route('/listar-atendimentos')
def listar_todos_atendimentos():
    try:
        atendimentos = service.listar_todos_atendimentos()
        Session.remove()
        return jsonify({
            "mensagem": "Atendimentos listados com sucesso!",
            "atendimentos": atendimentos
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        Session.remove()
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@atendimento_bp.route('/filtrar-atendimentos')
def filtrar_atendimentos():
    try:
        data = request.get_json()
        id_atendimento = data.get('id_atendimento')
        min_data = data.get('min_data')
        max_data = data.get('max_data')
        tipo_atendimento = data.get('tipo_atendimento')
        usuario = data.get('usuario')
        min_valor = data.get('min_valor')
        max_valor = data.get('max_valor')
        colaborador_atendimento = data.get('colaborador_atendimento')
        is_ativo = data.get('is_ativo')
        ids_clientes = data.get('ids_clientes')
        ids_exames = data.get('ids_exames')

        atendimentos_filtrados = service.filtrar_atendimentos(
            id_atendimento=id_atendimento,
            min_data=min_data,
            max_data=max_data,
            tipo_atendimento=tipo_atendimento,
            usuario=usuario,
            min_valor=min_valor,
            max_valor=max_valor,
            colaborador_atendimento=colaborador_atendimento,
            is_ativo=is_ativo,
            ids_clientes=ids_clientes,
            ids_exames=ids_exames
        )

        Session.remove()
        return jsonify({
            "mensagem": "Atendimentos filtrados com sucesso!",
            "atendimentos": atendimentos_filtrados
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        Session.remove()
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400

# Não tem remover atendimento, apenas cancelar
# @atendimento_bp.route('/remover-atendimento', methods=['DELETE'])
# def remover_atendimento():
#     try:
#         data = request.get_json()
#         id_atendimento = data.get('id_atendimento')

#         service.remover_atendimento(id_atendimento=id_atendimento)
#         Session.remove()
#         return ({
#             "mensagem": "Atendimento removido com sucesso!"
#         }), 200
#     except Exception as e:
#         print(f"Erro: {e}")
#         Session.remove()
#         return jsonify({
#             "erro": "Ocorreu um erro, tente novamente!"
#         }), 400


@atendimento_bp.route('/atualizar-atendimento', methods=['PUT'])
def atualizar_atendimento():
    try:
        data = request.get_json()
        id_atendimento = data.get('id_atendimento')
        data_atendimento = data.get('data_atendimento')
        tipo_atendimento = data.get('tipo_atendimento')
        usuario = data.get('usuario')
        valor = data.get('valor')
        colaborador_atendimento = data.get('colaborador_atendimento')
        is_ativo = data.get('is_ativo')
        id_cliente = data.get('id_cliente')
        ids_exames = data.get('ids_exames')

        atendimento_atualizado = service.atualizar_atendimento(
            id_atendimento=id_atendimento,
            data_atendimento=data_atendimento,
            tipo_atendimento=tipo_atendimento,
            usuario=usuario,
            valor=valor,
            colaborador_atendimento=colaborador_atendimento,
            is_ativo=is_ativo,
            id_cliente=id_cliente,
            ids_exames=ids_exames
        )
        Session.remove()
        return ({
            "mensagem": "Atendimento atualizado com sucesso!",
            "atendimento": atendimento_atualizado
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        Session.remove()
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400
