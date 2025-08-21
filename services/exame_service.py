from model.exame import Exame
from repository.exame_repository import ExameRepository
import json
import pandas as pd
from io import BytesIO


class ExameService():
    repositorio = ExameRepository()

    def cadastrar_exame(self, exame: Exame):
        self.repositorio.adicionar_exame(exame=exame)

    def listar_todos_exames(self):
        exames = self.repositorio.listar_todos_exames()
        lista = []
        for exame in exames:
            json_exame = {
                "id_exame": exame.id_exame,
                "nome_exame": exame.nome_exame,
                "valor_exame": exame.valor_exame,
                "is_interno": exame.is_interno
            }
            lista.append(json_exame)
        return lista

    def filtrar_exames(self, id_exame: int, nome_exame: str, is_interno: bool, min_valor: float, max_valor: float, por_pagina=50,
                       pagina: int = 1, order_by: str = "nome_cliente", order_dir: str = "desc"):
        if por_pagina is not None:
            offset = (pagina - 1) * por_pagina
        else:
            offset = None

        exames_filtrados, total, total_filtrado = self.repositorio.filtrar_exames(
            id_exame=id_exame,
            nome_exame=nome_exame,
            is_interno=is_interno,
            min_valor=min_valor,
            max_valor=max_valor,
            offset=offset,
            limit=por_pagina,
            order_by=order_by,
            order_dir=order_dir
        )
        lista_filtrada = []
        for exame in exames_filtrados:
            json_exame = {
                "id_exame": exame.id_exame,
                "nome_exame": exame.nome_exame,
                "valor_exame": exame.valor_exame,
                "is_interno": exame.is_interno
            }
            lista_filtrada.append(json_exame)
        return {
            "exames": lista_filtrada,
            "total": total,
            "total_filtrado": total_filtrado
        }

    def remover_exame(self, id_exame):
        self.repositorio.remover_exame(id_exame=id_exame)

    def atualizar_exame(self, id_exame, nome_exame, is_interno, valor_exame):
        exame_atualizado = self.repositorio.atualizar_exame(
            id_exame=id_exame,
            nome_exame=nome_exame,
            is_interno=is_interno,
            valor_exame=valor_exame
        )
        return exame_atualizado

    def exportar_excel(self, id_exame: int, nome_exame: str, is_interno: bool, min_valor: float, max_valor: float):

        exames_filtrados = self.filtrar_exames(
            id_exame=id_exame,
            nome_exame=nome_exame,
            is_interno=is_interno,
            min_valor=min_valor,
            max_valor=max_valor,
            por_pagina=None
        )

        linhas = []
        for exame in exames_filtrados.get("exames"):
            linha = {**exame}
            linhas.append(linha)

        novos_cabecalhos = {
            "id_exame": "ID Exame",
            "nome_exame": "Nome",
            "is_interno": "Interno",
            "valor_exame": "Valor Exame"
        }

        map_interno = {
            False: "Não",
            True: "Sim"
        }

        df = pd.DataFrame(linhas)
        df["is_interno"] = df["is_interno"].map(
            map_interno)
        df.rename(columns=novos_cabecalhos, inplace=True)
        output = BytesIO()
        with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
            df.to_excel(writer, sheet_name='Atendimentos', index=False)
        output.seek(0)

        return output

    def exportar_txt(self, id_exame: int, nome_exame: str, is_interno: bool, min_valor: float, max_valor: float):

        exames_filtrados = self.filtrar_exames(
            id_exame=id_exame,
            nome_exame=nome_exame,
            is_interno=is_interno,
            min_valor=min_valor,
            max_valor=max_valor,
            por_pagina=None
        )

        linhas = []
        for exame in exames_filtrados.get("exames"):
            linha = {**exame}
            linhas.append(linha)

        novos_cabecalhos = {
            "id_exame": "ID Exame",
            "nome_exame": "Nome",
            "is_interno": "Interno",
            "valor_exame": "Valor Exame"
        }

        map_interno = {
            False: "Não",
            True: "Sim"
        }

        df = pd.DataFrame(linhas)
        df["is_interno"] = df["is_interno"].map(
            map_interno)
        df.rename(columns=novos_cabecalhos, inplace=True)
        output = BytesIO()
        df.to_csv(output, sep="\t", index=False, encoding="utf-8")
        output.seek(0)

        return output
