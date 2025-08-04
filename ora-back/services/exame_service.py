from model.exame import Exame
from repository.exame_repository import ExameRepository
import json


class ExameService():
    repositorio = ExameRepository()

    def cadastrar_exame(self, exame: Exame):
        self.repositorio.adicionar_exame(exame=exame)

    def listar_todos_exames(self):
        exames = self.repositorio.listar_todos_exames()
        lista = []
        for exame in exames:
            json_exame = json.dumps({
                "id_exame": exame.id_exame,
                "nome_exame": exame.nome_exame,
                "valor_exame": exame.valor_exame,
                "is_interno": exame.is_interno
            })
            lista.append(json_exame)
        return lista

    def filtrar_exames(self, id_exame, nome_exame, is_interno, min_valor, max_valor):
        exames_filtrados = self.repositorio.filtrar_exames(
            id_exame=id_exame,
            nome_exame=nome_exame,
            is_interno=is_interno,
            min_valor=min_valor,
            max_valor=max_valor
        )
        lista_filtrada = []
        for exame in exames_filtrados:
            json_exame = json.dumps({
                "id_exame": exame.id_exame,
                "nome_exame": exame.nome_exame,
                "valor_exame": exame.valor_exame,
                "is_interno": exame.is_interno
            })
            lista_filtrada.append(json_exame)
        return lista_filtrada

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
