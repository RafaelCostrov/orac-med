from model.cliente import Cliente
from repository.cliente_repository import ClienteRepository
from repository.exame_repository import ExameRepository
from enums.tipos_cliente import TiposCliente
import json


class ClienteService():
    repositorio = ClienteRepository()
    repositorio_exame = ExameRepository()

    def cadastrar_cliente(self, nome_cliente: str, cnpj_cliente: str, tipo_cliente: TiposCliente, exames_incluidos: list[int]):
        exames = []
        for exame_id in exames_incluidos:
            exame = self.repositorio_exame.filtrar_por_id(exame_id)
            exames.append(exame)
        cliente = Cliente(
            nome_cliente=nome_cliente,
            cnpj_cliente=cnpj_cliente,
            tipo_cliente=tipo_cliente,
            exames_incluidos=exames
        )
        self.repositorio.adicionar_cliente(cliente=cliente)

    def listar_todos_clientes(self):
        clientes = self.repositorio.listar_todos_clientes()
        lista = []
        for cliente in clientes:
            exames = []
            for exame in cliente.exames_incluidos:
                json_exame = {
                    "id_exame": exame.id_exame,
                    "nome_exame": exame.nome_exame,
                    "valor_exame": exame.valor_exame,
                    "is_interno": exame.is_interno
                }
                exames.append(json_exame)
            json_cliente = {
                "id_cliente": cliente.id_cliente,
                "nome_cliente": cliente.nome_cliente,
                "cnpj_cliente": cliente.cnpj_cliente,
                "tipo_cliente": cliente.tipo_cliente.__str__(),
                "exames_incluidos": exames
            }
            lista.append(json_cliente)
        return lista

    def filtrar_clientes(self, id_cliente: int, nome_cliente: str, cnpj_cliente: str, tipo_cliente: TiposCliente, exames_incluidos: list[int]):
        clientes_filtrados = self.repositorio.filtrar_clientes(
            id_cliente=id_cliente,
            nome_cliente=nome_cliente,
            cnpj_cliente=cnpj_cliente,
            tipo_cliente=tipo_cliente,
            exames_incluidos=exames_incluidos,
        )
        lista_filtrada = []
        for cliente in clientes_filtrados:
            exames = []
            for exame in cliente.exames_incluidos:
                json_exame = {
                    "id_exame": exame.id_exame,
                    "nome_exame": exame.nome_exame,
                    "valor_exame": exame.valor_exame,
                    "is_interno": exame.is_interno
                }
                exames.append(json_exame)
            json_cliente = {
                "id_cliente": cliente.id_cliente,
                "nome_cliente": cliente.nome_cliente,
                "cnpj_cliente": cliente.cnpj_cliente,
                "tipo_cliente": cliente.tipo_cliente.__str__(),
                "exames_incluidos": exames
            }
            lista_filtrada.append(json_cliente)
        return lista_filtrada

    def remover_cliente(self, id_cliente):
        self.repositorio.remover_cliente(id_cliente=id_cliente)

    def atualizar_cliente(self, id_cliente, nome_cliente, cnpj_cliente, tipo_cliente, exames_incluidos):
        cliente = self.repositorio.filtrar_por_id(id_cliente=id_cliente)
        if exames_incluidos is not None:
            exames = []
            for exame_id in exames_incluidos:
                exame = self.repositorio_exame.filtrar_por_id(exame_id)
                exames.append(exame)
        else:
            exames = cliente.exames_incluidos
        cliente_atualizado = self.repositorio.atualizar_cliente(
            id_cliente=id_cliente,
            nome_cliente=nome_cliente,
            cnpj_cliente=cnpj_cliente,
            tipo_cliente=tipo_cliente,
            exames_incluidos=exames
        )
        exames_json = []
        for exames_atualizado in cliente_atualizado['exames_incluidos']:
            json_exame = {
                "id_exame": exames_atualizado.id_exame,
                "nome_exame": exames_atualizado.nome_exame,
                "valor_exame": exames_atualizado.valor_exame,
                "is_interno": exames_atualizado.is_interno
            }
            exames_json.append(json_exame)

        json_cliente = {
            "id_cliente": cliente_atualizado['id_cliente'],
            "nome_cliente": cliente_atualizado['nome_cliente'],
            "cnpj_cliente": cliente_atualizado['cnpj_cliente'],
            "tipo_cliente": cliente_atualizado['tipo_cliente'],
            "exames_incluidos": exames_json
        }
        return json_cliente
