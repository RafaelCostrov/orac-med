from model.atendimento import Atendimento
from repository.cliente_repository import ClienteRepository
from repository.exame_repository import ExameRepository
from repository.atendimento_repository import AtendimentoRepository
from enums.tipos_atendimento import TiposAtendimento
import json
import datetime


class AtendimentoService():
    repositorio = AtendimentoRepository()
    repositorio_cliente = ClienteRepository()
    repositorio_exame = ExameRepository()

    def cadastrar_atendimento(self, tipo_atendimento: TiposAtendimento, usuario: str, valor: float, colaborador_atendimento: str, id_cliente: int, ids_exames: list[int]):
        exames = []
        valor_exames = 0
        for exame_id in ids_exames:
            exame = self.repositorio_exame.filtrar_por_id(exame_id)
            exames.append(exame)
            valor_exame = exame.valor_exame
            valor_exames += valor_exame
        if valor is not None:
            valor_final = valor
        else:
            valor_final = valor_exames
        cliente = self.repositorio_cliente.filtrar_por_id(id_cliente)
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
            for exame in atendimento.exames_atendimento:
                json_exame = {
                    "nome_exame": exame.nome_exame,
                    "valor_exame": exame.valor_exame,
                    "is_interno": exame.is_interno
                }
                exames.append(json_exame)
            json_cliente = {
                "id_cliente": atendimento.cliente_atendimento.id_cliente,
                "nome_cliente": atendimento.cliente_atendimento.nome_cliente,
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

    def filtrar_atendimentos(self, id_atendimento: str, min_data: str, max_data: str, tipo_atendimento: TiposAtendimento, usuario: str, min_valor: float,
                             max_valor: str, colaborador_atendimento: str, is_ativo: bool, ids_clientes: list[int], ids_exames: list[int]):
        atendimentos_filtrados = self.repositorio.filtrar_atendimentos(
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

        lista_filtrada = []
        for atendimento in atendimentos_filtrados:
            exames = []
            for exame in atendimento.exames_atendimento:
                json_exame = {
                    "nome_exame": exame.nome_exame,
                    "valor_exame": exame.valor_exame,
                    "is_interno": exame.is_interno
                }
                exames.append(json_exame)
            json_cliente = {
                "id_cliente": atendimento.cliente_atendimento.id_cliente,
                "nome_cliente": atendimento.cliente_atendimento.nome_cliente,
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
        return lista_filtrada

    def remover_atendimento(self, id_atendimento):
        self.repositorio.remover_atendimento(id_atendimento=id_atendimento)

    def atualizar_atendimento(self, id_atendimento, data_atendimento, tipo_atendimento, usuario, valor,
                              colaborador_atendimento, is_ativo, id_cliente, ids_exames):
        atendimento = self.repositorio.filtrar_por_id(
            id_atendimento=id_atendimento)

        if ids_exames is not None:
            json_exames = []
            for exame_id in ids_exames:
                exame = self.repositorio_exame.filtrar_por_id(exame_id)
                json_exames.append(exame)
        else:
            json_exames = atendimento.exames_atendimento

        if id_cliente is not None:
            cliente = self.repositorio_cliente.filtrar_por_id(
                id_cliente=id_cliente)
        else:
            cliente = atendimento.cliente_atendimento

        atendimento_atualizado = self.repositorio.atualizar_atendimento(
            id_atendimento=id_atendimento,
            data_atendimento=data_atendimento,
            tipo_atendimento=tipo_atendimento,
            usuario=usuario,
            valor=valor,
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
