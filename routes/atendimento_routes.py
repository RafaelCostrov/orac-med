from flask import Blueprint, request, jsonify, send_file, session
from services.atendimento_service import AtendimentoService
from datetime import datetime
from auxiliar.auxiliar import role_required, login_required

atendimento_bp = Blueprint('atendimento', __name__, url_prefix='/atendimentos')

service = AtendimentoService()


@atendimento_bp.route('/cadastrar-atendimento', methods=['POST'])
@login_required
def cadastrar_atendimento():
    try:
        data = request.get_json()
        tipo_atendimento = data.get('tipo_atendimento')
        usuario = str(session['usuario']['nome_usuario'])
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
        return jsonify({
            "mensagem": f"Atendimento cadastrado!"
        }), 201
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro! Tente novamente"
        }), 400


@atendimento_bp.route('/listar-atendimentos')
@login_required
def listar_todos_atendimentos():
    try:
        atendimentos = service.listar_todos_atendimentos()
        return jsonify({
            "mensagem": "Atendimentos listados com sucesso!",
            "atendimentos": atendimentos
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@atendimento_bp.route('/filtrar-atendimentos', methods=['POST'])
@login_required
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
        tipo_cliente = data.get('tipo_cliente')
        is_ativo = data.get('is_ativo')
        ids_clientes = data.get('ids_clientes')
        ids_exames = data.get('ids_exames')
        pagina = data.get('pagina', 1)
        por_pagina = data.get('por_pagina', 20)
        order_by = data.get('order_by')
        order_dir = data.get('order_dir')

        atendimentos_filtrados = service.filtrar_atendimentos(
            id_atendimento=id_atendimento,
            min_data=min_data,
            max_data=max_data,
            tipo_atendimento=tipo_atendimento,
            usuario=usuario,
            min_valor=min_valor,
            max_valor=max_valor,
            colaborador_atendimento=colaborador_atendimento,
            tipo_cliente=tipo_cliente,
            is_ativo=is_ativo,
            ids_clientes=ids_clientes,
            ids_exames=ids_exames,
            pagina=pagina,
            por_pagina=por_pagina,
            order_by=order_by,
            order_dir=order_dir
        )

        return jsonify({
            "mensagem": "Atendimentos filtrados com sucesso!",
            **atendimentos_filtrados
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@atendimento_bp.route('/atualizar-atendimento', methods=['PUT'])
@login_required
@role_required("administrador", "gestor")
def atualizar_atendimento():
    try:
        data = request.get_json()
        id_atendimento = data.get('id_atendimento')
        data_atendimento = data.get('data_atendimento')
        tipo_atendimento = data.get('tipo_atendimento')
        valor = data.get('valor')
        colaborador_atendimento = data.get('colaborador_atendimento')
        is_ativo = data.get('is_ativo')
        id_cliente = data.get('id_cliente')
        ids_exames = data.get('ids_exames')

        usuario = str(session['usuario']['nome_usuario'])

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
        return ({
            "mensagem": "Atendimento atualizado com sucesso!",
            "atendimento": atendimento_atualizado
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@atendimento_bp.route('/exportar-atendimentos-xls', methods=['POST'])
@login_required
def exportar_excel():
    try:
        data = request.get_json().get("filtrosAtuais")
        id_atendimento = data.get('id_atendimento')
        min_data = data.get('min_data')
        max_data = data.get('max_data')
        tipo_atendimento = data.get('tipo_atendimento')
        usuario = data.get('usuario')
        min_valor = data.get('min_valor')
        max_valor = data.get('max_valor')
        colaborador_atendimento = data.get('colaborador_atendimento')
        tipo_cliente = data.get('tipo_cliente')
        is_ativo = data.get('is_ativo')
        ids_clientes = data.get('ids_clientes')
        ids_exames = data.get('ids_exames')

        arquivo = service.exportar_excel(
            id_atendimento=id_atendimento,
            min_data=min_data,
            max_data=max_data,
            tipo_atendimento=tipo_atendimento,
            usuario=usuario,
            min_valor=min_valor,
            max_valor=max_valor,
            colaborador_atendimento=colaborador_atendimento,
            tipo_cliente=tipo_cliente,
            is_ativo=is_ativo,
            ids_clientes=ids_clientes,
            ids_exames=ids_exames
        )

        agora = datetime.now()
        hora = agora.strftime("%H-%M-%S")
        nome_excel = f"Atendimentos_{hora}.xlsx"

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


@atendimento_bp.route('/exportar-atendimentos-txt', methods=['POST'])
@login_required
def exportar_txt():
    try:
        data = request.get_json().get("filtrosAtuais")
        id_atendimento = data.get('id_atendimento')
        min_data = data.get('min_data')
        max_data = data.get('max_data')
        tipo_atendimento = data.get('tipo_atendimento')
        usuario = data.get('usuario')
        min_valor = data.get('min_valor')
        max_valor = data.get('max_valor')
        colaborador_atendimento = data.get('colaborador_atendimento')
        tipo_cliente = data.get('tipo_cliente')
        is_ativo = data.get('is_ativo')
        ids_clientes = data.get('ids_clientes')
        ids_exames = data.get('ids_exames')

        arquivo = service.exportar_txt(
            id_atendimento=id_atendimento,
            min_data=min_data,
            max_data=max_data,
            tipo_atendimento=tipo_atendimento,
            usuario=usuario,
            min_valor=min_valor,
            max_valor=max_valor,
            colaborador_atendimento=colaborador_atendimento,
            tipo_cliente=tipo_cliente,
            is_ativo=is_ativo,
            ids_clientes=ids_clientes,
            ids_exames=ids_exames
        )

        agora = datetime.now()
        hora = agora.strftime("%H-%M-%S")
        nome_txt = f"Atendimentos_{hora}.txt"

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
