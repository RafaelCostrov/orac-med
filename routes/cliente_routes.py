from flask import Blueprint, request, jsonify, send_file
from services.cliente_service import ClienteService
from datetime import datetime
from auxiliar.auxiliar import role_required, login_required

cliente_bp = Blueprint('cliente', __name__, url_prefix='/clientes')

service = ClienteService()


@cliente_bp.route('/cadastrar-cliente', methods=['POST'])
@login_required
def cadastrar_cliente():
    try:
        data = request.get_json()
        nome_cliente = data.get('nome_cliente')
        cnpj_cliente = data.get('cnpj_cliente')
        tipo_cliente = data.get('tipo_cliente')
        exames_incluidos = data.get('exames_incluidos')

        retorno = service.cadastrar_cliente(
            nome_cliente=nome_cliente,
            cnpj_cliente=cnpj_cliente,
            tipo_cliente=tipo_cliente,
            exames_incluidos=exames_incluidos
        )
        if retorno is not None:
            if "CNPJ já cadastrado" in retorno.get("erro", ""):
                return jsonify(retorno), 400

        return jsonify({
            "mensagem": f"Cliente cadastrado!"
        }), 201
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro! Tente novamente"
        }), 400


@cliente_bp.route('/listar-clientes')
@login_required
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
@login_required
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
@login_required
@role_required("administrador", "gestor")
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
@login_required
@role_required("administrador", "gestor")
def atualizar_cliente():
    try:
        data = request.get_json()
        id_cliente = data.get('id_cliente')
        nome_cliente = data.get('nome_cliente')
        cnpj_cliente = data.get('cnpj_cliente')
        tipo_cliente = data.get('tipo_cliente')
        exames_incluidos = data.get('exames_incluidos')

        cliente_atualizado = service.atualizar_cliente(
            id_cliente=id_cliente,
            nome_cliente=nome_cliente,
            cnpj_cliente=cnpj_cliente,
            tipo_cliente=tipo_cliente,
            exames_incluidos=exames_incluidos
        )
        if "CNPJ já cadastrado" in cliente_atualizado.get("erro", ""):
            return jsonify(cliente_atualizado), 400

        return jsonify({
            "mensagem": "Cliente atualizado com sucesso!",
            "cliente": cliente_atualizado
        }), 200
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({
            "erro": "Ocorreu um erro, tente novamente!"
        }), 400


@cliente_bp.route('/buscar-cnpj', methods=['POST'])
@login_required
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


@cliente_bp.route('/exportar-clientes-xls', methods=['POST'])
@login_required
def exportar_excel():
    try:
        data = request.get_json()
        id_cliente = data.get('id_cliente')
        nome_cliente = data.get('nome_cliente')
        cnpj_cliente = data.get('cnpj_cliente')
        tipo_cliente = data.get('tipo_cliente')
        exames_incluidos = data.get('exames_incluidos')

        arquivo = service.exportar_excel(
            id_cliente=id_cliente,
            nome_cliente=nome_cliente,
            cnpj_cliente=cnpj_cliente,
            tipo_cliente=tipo_cliente,
            exames_incluidos=exames_incluidos
        )

        agora = datetime.now()
        hora = agora.strftime("%H-%M-%S")
        nome_excel = f"Clientes_{hora}.xlsx"

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


@cliente_bp.route('/exportar-clientes-txt', methods=['POST'])
@login_required
def exportar_txt():
    try:
        data = request.get_json()
        id_cliente = data.get('id_cliente')
        nome_cliente = data.get('nome_cliente')
        cnpj_cliente = data.get('cnpj_cliente')
        tipo_cliente = data.get('tipo_cliente')
        exames_incluidos = data.get('exames_incluidos')

        arquivo = service.exportar_txt(
            id_cliente=id_cliente,
            nome_cliente=nome_cliente,
            cnpj_cliente=cnpj_cliente,
            tipo_cliente=tipo_cliente,
            exames_incluidos=exames_incluidos
        )

        agora = datetime.now()
        hora = agora.strftime("%H-%M-%S")
        nome_txt = f"Clientes_{hora}.txt"

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
