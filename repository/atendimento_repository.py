from sqlalchemy import func, and_
from sqlalchemy.orm import joinedload
from model.exame import Exame
from model.cliente import Cliente
from model.atendimento import Atendimento
from db.db import Session
from datetime import datetime


class AtendimentoRepository:
    def __init__(self):
        self.session = Session

    def adicionar_atendimento(self, atendimento: Atendimento):
        try:
            self.session.add(atendimento)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            raise e

    def listar_todos_atendimentos(self):
        try:
            atendimentos = self.session.query(Atendimento).options(
                joinedload(Atendimento.exames_atendimento),
                joinedload(Atendimento.cliente_atendimento)).all()
            return atendimentos
        except Exception as e:
            raise e

    def filtrar_atendimentos(self, id_atendimento=None, min_data=None, max_data=None, tipo_atendimento=None, usuario=None, min_valor=None,
                             max_valor=None, colaborador_atendimento=None, tipo_cliente=None, is_ativo=None, ids_clientes=None,
                             ids_exames=None, offset=None, limit=None, order_by=None, order_dir=None):
        try:
            query = self.session.query(Atendimento)
            total = query.count()
            filtros = []

            if id_atendimento is not None:
                filtros.append(Atendimento.id_atendimento == id_atendimento)

            if min_data:
                data_formatada = datetime.strptime(min_data, "%Y-%m-%d")
                filtros.append(Atendimento.data_atendimento >= data_formatada)

            if max_data:
                data_formatada = datetime.strptime(max_data, "%Y-%m-%d")
                data_formatada = data_formatada.replace(
                    hour=23, minute=59, second=59)
                filtros.append(Atendimento.data_atendimento <= data_formatada)

            if tipo_atendimento:
                filtros.append(Atendimento.tipo_atendimento.in_(tipo_atendimento)
                               )

            if usuario:
                filtros.append(func.lower(
                    Atendimento.usuario).like(f"%{usuario}%"))

            if min_valor:
                filtros.append(Atendimento.valor >= min_valor)

            if max_valor:
                filtros.append(Atendimento.valor <= max_valor)

            if colaborador_atendimento:
                filtros.append(func.lower(
                    Atendimento.colaborador_atendimento).like(f"%{colaborador_atendimento}%"))

            if tipo_cliente:
                filtros.append(Atendimento.cliente_atendimento.has(
                    Cliente.tipo_cliente.in_(tipo_cliente)
                ))

            if is_ativo is not None:
                filtros.append(Atendimento.is_ativo == is_ativo)

            if ids_clientes:
                filtros.append(Atendimento.id_cliente.in_(ids_clientes))

            if ids_exames:
                query = query.join(Atendimento.exames_atendimento)\
                    .filter(Exame.id_exame.in_(ids_exames))

            query = query.filter(and_(*filtros)).options(
                joinedload(Atendimento.cliente_atendimento),
                joinedload(Atendimento.exames_atendimento)
            )

            campos_permitidos = {
                "id_atendimento": Atendimento.id_atendimento,
                "nome_cliente": Cliente.nome_cliente,
                "colaborador_atendimento": Atendimento.colaborador_atendimento,
                "tipo_atendimento": Atendimento.tipo_atendimento,
                "tipo_cliente": Cliente.tipo_cliente,
                "data_atendimento": Atendimento.data_atendimento,
                "valor": Atendimento.valor,
            }

            if order_by in campos_permitidos:
                coluna = campos_permitidos[order_by]
                if order_dir == "desc":
                    coluna = coluna.desc()
                else:
                    coluna = coluna.asc()

                if order_by in ["nome_cliente", "tipo_cliente"]:
                    query = query.join(Atendimento.cliente_atendimento)

                query = query.order_by(coluna)

            total_filtrado = query.count()
            valor_total = query.with_entities(
                func.sum(Atendimento.valor)).scalar()
            if offset is not None:
                query = query.offset(offset)
            if limit is not None:
                query = query.limit(limit)

            resultados = query.all()
            return resultados, total, total_filtrado, valor_total

        except Exception as e:
            raise e

    def filtrar_por_id(self, id_atendimento):
        try:
            atendimento = self.session.query(Atendimento)\
                .options(joinedload(Atendimento.cliente_atendimento).joinedload(Cliente.exames_incluidos), joinedload(Atendimento.exames_atendimento))\
                .filter(Atendimento.id_atendimento == id_atendimento).first()
            return atendimento
        except Exception as e:
            raise e

    def remover_atendimento(self, id_atendimento):
        try:
            atendimento_a_remover = self.filtrar_por_id(
                id_atendimento=id_atendimento)
            self.session.delete(atendimento_a_remover)
            self.session.commit()
        except Exception as e:
            raise e

    def atualizar_atendimento(self, id_atendimento, data_atendimento, tipo_atendimento, usuario, valor,
                              colaborador_atendimento, is_ativo, cliente_atendimento, exames_atendimento):
        try:
            atendimento_a_atualizar = self.filtrar_por_id(
                id_atendimento=id_atendimento)

            if data_atendimento is not None:
                data_formatada = datetime.strptime(
                    data_atendimento, "%d/%m/%Y")
                atendimento_a_atualizar.data_atendimento = data_formatada

            if tipo_atendimento is not None and tipo_atendimento != "":
                atendimento_a_atualizar.tipo_atendimento = tipo_atendimento

            if usuario is not None and usuario != "":
                atendimento_a_atualizar.usuario = usuario

            if valor is not None:
                atendimento_a_atualizar.valor = valor

            if colaborador_atendimento is not None and colaborador_atendimento != "":
                atendimento_a_atualizar.colaborador_atendimento = colaborador_atendimento

            if is_ativo is not None:
                atendimento_a_atualizar.is_ativo = is_ativo

            if cliente_atendimento is not None:
                atendimento_a_atualizar.cliente_atendimento = cliente_atendimento

            if exames_atendimento is not None:
                atendimento_a_atualizar.exames_atendimento = exames_atendimento

            self.session.commit()
            return {
                "id_atendimento": atendimento_a_atualizar.id_atendimento,
                "data_atendimento": atendimento_a_atualizar.data_atendimento,
                "tipo_atendimento": atendimento_a_atualizar.tipo_atendimento.__str__(),
                "usuario": atendimento_a_atualizar.usuario,
                "valor": atendimento_a_atualizar.valor,
                "colaborador_atendimento": atendimento_a_atualizar.colaborador_atendimento,
                "is_ativo": atendimento_a_atualizar.is_ativo,
                "cliente_atendimento": atendimento_a_atualizar.cliente_atendimento,
                "exames_atendimento": atendimento_a_atualizar.exames_atendimento
            }
        except Exception as e:
            self.session.rollback()
            raise e
