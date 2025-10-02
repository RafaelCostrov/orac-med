from model.atendimento import Atendimento
from repository.cliente_repository import ClienteRepository
from repository.exame_repository import ExameRepository
from repository.atendimento_repository import AtendimentoRepository
from enums.tipos_atendimento import TiposAtendimento
from enums.tipos_cliente import TiposCliente
import json
import datetime
import pandas as pd
from io import BytesIO


class AtendimentoService():
    repositorio = AtendimentoRepository()
    repositorio_cliente = ClienteRepository()
    repositorio_exame = ExameRepository()

    def cadastrar_atendimento(self, tipo_atendimento: TiposAtendimento, usuario: str, valor: float, colaborador_atendimento: str, id_cliente: int,
                              ids_exames: list[int]):
        exames = []
        valor_exames = 0

        cliente = self.repositorio_cliente.filtrar_por_id(id_cliente)
        exames_incluidos = cliente.exames_incluidos

        for id_exame in ids_exames:
            exame = self.repositorio_exame.filtrar_por_id(id_exame)
            exames.append(exame)
            if id_exame not in [exame_incluido.id_exame for exame_incluido in exames_incluidos]:
                valor_exame = exame.valor_exame
                valor_exames += valor_exame
        if valor is not None:
            valor_final = valor
        else:
            valor_final = valor_exames
        data_hora = datetime.datetime.now()
        atendimento = Atendimento(
            data_atendimento=data_hora,
            tipo_atendimento=tipo_atendimento,
            usuario=usuario,
            valor=valor_final,
            colaborador_atendimento=colaborador_atendimento,
            is_ativo=True,
            cliente_atendimento=cliente,
            exames_atendimento=exames
        )
        self.repositorio.adicionar_atendimento(atendimento=atendimento)

    def listar_todos_atendimentos(self):
        atendimentos = self.repositorio.listar_todos_atendimentos()
        lista = []
        for atendimento in atendimentos:
            exames = []
            for exame in atendimento.exames_atendimento or []:
                json_exame = {
                    "id_exame": exame.id_exame if exame else None,
                    "nome_exame": exame.nome_exame if exame else "Exame removido",
                    "valor_exame": exame.valor_exame if exame else 0,
                    "is_interno": exame.is_interno if exame else False
                }
                exames.append(json_exame)

            if atendimento.cliente_atendimento:
                json_cliente = {
                    "id_cliente": atendimento.cliente_atendimento.id_cliente,
                    "nome_cliente": atendimento.cliente_atendimento.nome_cliente,
                }
            else:
                json_cliente = {
                    "id_cliente": None,
                    "nome_cliente": "Empresa removida"
                }
            json_atendimento = {
                "id_atendimento": atendimento.id_atendimento,
                "data_atendimento": atendimento.data_atendimento.strftime("%d/%m/%Y"),
                "tipo_atendimento": atendimento.tipo_atendimento.__str__(),
                "usuario": atendimento.usuario,
                "valor": atendimento.valor,
                "colaborador_atendimento": atendimento.colaborador_atendimento,
                "is_ativo": atendimento.is_ativo,
                "cliente_atendimento": json_cliente,
                "exames_atendimento": exames
            }
            lista.append(json_atendimento)
        return lista

    def filtrar_atendimentos(self, id_atendimento: str, min_data: str, max_data: str, tipo_atendimento: list[TiposAtendimento],
                             usuario: str, min_valor: float, max_valor: str, colaborador_atendimento: str, tipo_cliente: list[TiposCliente],
                             is_ativo: bool, ids_clientes: list[int], ids_exames: list[int], pagina: int = 1, por_pagina=50,
                             order_by: str = "data_atendimento", order_dir: str = "desc"):
        if por_pagina is not None:
            offset = (pagina - 1) * por_pagina
        else:
            offset = None
        atendimentos_filtrados, total, total_filtrado, valor_total = self.repositorio.filtrar_atendimentos(
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
            offset=offset,
            limit=por_pagina,
            order_by=order_by,
            order_dir=order_dir
        )

        lista_filtrada = []
        for atendimento in atendimentos_filtrados:
            exames = []
            exames_atendimento = atendimento.exames_atendimento
            if not exames_atendimento:
                json_exame = {
                    "id_exame": None,
                    "nome_exame": "Exame removido",
                    "valor_exame": 0,
                    "is_interno": False
                }
                exames.append(json_exame)
            else:
                for exame in exames_atendimento:
                    if exame:
                        json_exame = {
                            "id_exame": exame.id_exame,
                            "nome_exame": exame.nome_exame,
                            "valor_exame": exame.valor_exame,
                            "is_interno": exame.is_interno
                        }
                    else:
                        json_exame = {
                            "nome_exame": "Exame removido",
                            "valor_exame": 0,
                            "is_interno": False
                        }
                    exames.append(json_exame)
            if atendimento.cliente_atendimento:
                json_cliente = {
                    "id_cliente": atendimento.cliente_atendimento.id_cliente,
                    "nome_cliente": atendimento.cliente_atendimento.nome_cliente,
                    "tipo_cliente": atendimento.cliente_atendimento.tipo_cliente.__str__()
                }
            else:
                json_cliente = {
                    "id_cliente": None,
                    "nome_cliente": "Empresa removida",
                    "tipo_cliente": "Removido"
                }

            json_atendimento = {
                "id_atendimento": atendimento.id_atendimento,
                "data_atendimento": atendimento.data_atendimento.strftime("%d/%m/%Y"),
                "tipo_atendimento": atendimento.tipo_atendimento.__str__(),
                "usuario": atendimento.usuario,
                "valor": atendimento.valor,
                "colaborador_atendimento": atendimento.colaborador_atendimento,
                "is_ativo": atendimento.is_ativo,
                "cliente_atendimento": json_cliente,
                "exames_atendimento": exames
            }
            lista_filtrada.append(json_atendimento)
        return {
            "total": total,
            "total_filtrado": total_filtrado,
            "atendimentos": lista_filtrada,
            "valor_total": valor_total
        }

    def remover_atendimento(self, id_atendimento):
        self.repositorio.remover_atendimento(id_atendimento=id_atendimento)

    def atualizar_atendimento(self, id_atendimento, data_atendimento, tipo_atendimento, usuario, valor,
                              colaborador_atendimento, is_ativo, id_cliente, ids_exames):
        atendimento = self.repositorio.filtrar_por_id(
            id_atendimento=id_atendimento)
        valor_exames = 0

        if id_cliente is not None:
            cliente = self.repositorio_cliente.filtrar_por_id(
                id_cliente=id_cliente)
        else:
            cliente = atendimento.cliente_atendimento
        exames_incluidos = cliente.exames_incluidos

        if ids_exames is not None:
            json_exames = []
            for exame_id in ids_exames:
                exame = self.repositorio_exame.filtrar_por_id(exame_id)
                json_exames.append(exame)
                if exame_id not in [exame_incluido.id_exame for exame_incluido in exames_incluidos]:
                    valor_exame = exame.valor_exame
                    valor_exames += valor_exame
            if valor is not None:
                valor_final = valor
            else:
                valor_final = valor_exames
        else:
            json_exames = atendimento.exames_atendimento

        atendimento_atualizado = self.repositorio.atualizar_atendimento(
            id_atendimento=id_atendimento,
            data_atendimento=data_atendimento,
            tipo_atendimento=tipo_atendimento,
            usuario=usuario,
            valor=valor_final,
            colaborador_atendimento=colaborador_atendimento,
            is_ativo=is_ativo,
            cliente_atendimento=cliente,
            exames_atendimento=json_exames
        )

        json_exames = []
        for exames_atualizado in atendimento_atualizado.get('exames_atendimento'):
            json_exame = {
                "id_exame": exames_atualizado.id_exame,
                "nome_exame": exames_atualizado.nome_exame,
                "valor_exame": exames_atualizado.valor_exame,
                "is_interno": exames_atualizado.is_interno
            }
            json_exames.append(json_exame)

        cliente_atualizado = atendimento_atualizado.get('cliente_atendimento')
        json_exames_incluidos = []
        for exame_incluido in cliente_atualizado.exames_incluidos:
            json_exame_incluido = {
                "id_exame": exame_incluido.id_exame,
                "nome_exame": exame_incluido.nome_exame,
                "valor_exame": exame_incluido.valor_exame,
                "is_interno": exame_incluido.is_interno
            }
            json_exames_incluidos.append(json_exame_incluido)

        json_cliente = {
            "id_cliente": cliente_atualizado.id_cliente,
            "nome_cliente": cliente_atualizado.nome_cliente,
            "exames_incluidos": json_exames_incluidos
        }

        json_atendimento = {
            "id_atendimento": atendimento_atualizado.get('id_atendimento'),
            "data_atendimento": atendimento_atualizado.get('data_atendimento').strftime("%d/%m/%Y"),
            "tipo_atendimento": atendimento_atualizado.get('tipo_atendimento'),
            "usuario": atendimento_atualizado.get('usuario'),
            "valor": atendimento_atualizado.get('valor'),
            "colaborador_atendimento": atendimento_atualizado.get('colaborador_atendimento'),
            "is_ativo": atendimento_atualizado.get('is_ativo'),
            "cliente_atendimento": json_cliente,
            "exames_atendimento": json_exames
        }

        return json_atendimento

    def exportar_excel(self, id_atendimento: str, min_data: str, max_data: str, tipo_atendimento: TiposAtendimento, usuario: str, min_valor: float,
                       max_valor: str, colaborador_atendimento: str, tipo_cliente: TiposCliente, is_ativo: bool, ids_clientes: list[int], ids_exames: list[int]):
        atendimentos_filtrados = self.filtrar_atendimentos(
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
            por_pagina=None
        )

        linhas = []
        for atendimento in atendimentos_filtrados.get("atendimentos"):
            cliente = atendimento.pop("cliente_atendimento")
            nomes_exames = [exame.get("nome_exame") for exame in atendimento.get(
                "exames_atendimento", [])]
            exames_str = ", ".join(nomes_exames)
            atendimento["exames_atendimento"] = exames_str
            linha = {**atendimento, **cliente}
            linhas.append(linha)

        novos_cabecalhos = {
            "id_atendimento": "ID Atendimento",
            "data_atendimento": "Data",
            "tipo_atendimento": "Tipo",
            "usuario": "Atendente",
            "valor": "Valor",
            "colaborador_atendimento": "Colaborador",
            "is_ativo": "Status",
            "exames_atendimento": "Exames",
            "id_cliente": "ID Cliente",
            "nome_cliente": "Nome Cliente",
            "tipo_cliente": "Tipo Cliente",
        }

        map_tipos_atendimento = {
            "admissional": "Admissional",
            "demissional": "Demissional",
            "periodico": "Periódico",
            "mudanca_funcao": "Mudança de Função",
            "retorno_trabalho": "Retorno ao Trabalho",
            "outros": "Outros"
        }

        map_tipos_cliente = {
            "cliente": "Cliente",
            "credenciado": "Credenciado",
            "servico_prestado": "Serviço Prestado",
            "particular": "Particular"
        }

        map_status = {
            True: "Ativo",
            False: "Cancelado"
        }

        df = pd.DataFrame(linhas)
        df["tipo_atendimento"] = df["tipo_atendimento"].map(
            map_tipos_atendimento)
        df["tipo_cliente"] = df["tipo_cliente"].map(map_tipos_cliente)
        df["is_ativo"] = df["is_ativo"].map(map_status)
        df.rename(columns=novos_cabecalhos, inplace=True)
        output = BytesIO()
        with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
            df.to_excel(writer, sheet_name='Atendimentos', index=False)
        output.seek(0)

        return output

    def exportar_txt(self, id_atendimento: str, min_data: str, max_data: str, tipo_atendimento: TiposAtendimento, usuario: str, min_valor: float,
                     max_valor: str, colaborador_atendimento: str, tipo_cliente: TiposCliente, is_ativo: bool, ids_clientes: list[int], ids_exames: list[int]):
        atendimentos_filtrados = self.filtrar_atendimentos(
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
            por_pagina=None
        )

        linhas = []
        for atendimento in atendimentos_filtrados.get("atendimentos"):
            cliente = atendimento.pop("cliente_atendimento")
            nomes_exames = [exame.get("nome_exame") for exame in atendimento.get(
                "exames_atendimento", [])]
            exames_str = ", ".join(nomes_exames)
            atendimento["exames_atendimento"] = exames_str
            linha = {**atendimento, **cliente}
            linhas.append(linha)

        novos_cabecalhos = {
            "id_atendimento": "ID Atendimento",
            "data_atendimento": "Data",
            "tipo_atendimento": "Tipo",
            "usuario": "Atendente",
            "valor": "Valor",
            "colaborador_atendimento": "Colaborador",
            "is_ativo": "Status",
            "exames_atendimento": "Exames",
            "id_cliente": "ID Cliente",
            "nome_cliente": "Nome Cliente",
            "tipo_cliente": "Tipo Cliente",
        }

        map_tipos_atendimento = {
            "admissional": "Admissional",
            "demissional": "Demissional",
            "periodico": "Periódico",
            "mudanca_funcao": "Mudança de Função",
            "retorno_trabalho": "Retorno ao Trabalho",
            "outros": "Outros"
        }

        map_tipos_cliente = {
            "cliente": "Cliente",
            "credenciado": "Credenciado",
            "servico_prestado": "Serviço Prestado",
            "particular": "Particular"
        }

        map_status = {
            True: "Ativo",
            False: "Cancelado"
        }
        df = pd.DataFrame(linhas)

        df["tipo_atendimento"] = df["tipo_atendimento"].map(
            map_tipos_atendimento)
        df["tipo_cliente"] = df["tipo_cliente"].map(map_tipos_cliente)
        df["is_ativo"] = df["is_ativo"].map(map_status)
        df.rename(columns=novos_cabecalhos, inplace=True)
        output = BytesIO()
        df.to_csv(output, sep="\t", index=False,
                  encoding="utf-8")
        output.seek(0)

        return output
