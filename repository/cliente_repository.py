from sqlalchemy import func, and_, distinct
from sqlalchemy.orm import joinedload
from model.exame import Exame
from model.cliente import Cliente
from db.db import Session


class ClienteRepository:
    def __init__(self):
        self.session = Session

    def adicionar_cliente(self, cliente: Cliente):
        try:
            self.session.add(cliente)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            raise e

    def listar_todos_clientes(self):
        try:
            clientes = self.session.query(Cliente).options(
                joinedload(Cliente.exames_incluidos)).all()
            return clientes
        except Exception as e:
            raise e

    def filtrar_clientes(self, id_cliente=None, nome_cliente=None, cnpj_cliente=None, tipo_cliente=None, exames_incluidos=None, offset=None,
                         limit=None, order_by=None, order_dir=None):
        try:
            query = self.session.query(Cliente)
            total = query.count()
            filtros = []

            if id_cliente is not None:
                filtros.append(Cliente.id_cliente == id_cliente)

            if nome_cliente:
                filtros.append(func.lower(
                    Cliente.nome_cliente).like(f"%{nome_cliente}%"))

            if cnpj_cliente:
                filtros.append(func.lower(
                    Cliente.cnpj_cliente).like(f"%{cnpj_cliente}%"))

            if tipo_cliente:
                filtros.append(func.lower(
                    Cliente.tipo_cliente.in_(tipo_cliente)
                ))

            if exames_incluidos:
                query = query.join(Cliente.exames_incluidos)\
                    .filter(Exame.id_exame.in_(exames_incluidos))

            query = query.filter(
                and_(*filtros)).options(joinedload(Cliente.exames_incluidos))

            campos_permitidos = {
                "id_cliente": Cliente.id_cliente,
                "nome_cliente": Cliente.nome_cliente,
                "cnpj_cliente": Cliente.cnpj_cliente,
                "tipo_cliente": Cliente.tipo_cliente
            }

            if order_by in campos_permitidos:
                coluna = campos_permitidos[order_by]
                if order_dir == "desc":
                    coluna = coluna.desc()
                else:
                    coluna = coluna.asc()

                query = query.order_by(coluna)

            total_filtrado = query.count()
            if offset is not None:
                query = query.offset(offset)
            if limit is not None:
                query = query.limit(limit)

            resultados = query.all()
            return resultados, total, total_filtrado
        except Exception as e:
            raise e

    def filtrar_por_id(self, id_cliente):
        try:
            cliente = self.session.query(Cliente)\
                .options(joinedload(Cliente.exames_incluidos))\
                .filter(Cliente.id_cliente == id_cliente).first()
            return cliente
        except Exception as e:
            raise e

    def filtrar_por_cnpj(self, cnpj_cliente):
        try:
            cliente = self.session.query(Cliente)\
                .options(joinedload(Cliente.exames_incluidos))\
                .filter(Cliente.cnpj_cliente == cnpj_cliente).first()
            return cliente
        except Exception as e:
            raise e

    def remover_cliente(self, id_cliente):
        try:
            cliente_a_remover = self.filtrar_por_id(id_cliente=id_cliente)
            self.session.delete(cliente_a_remover)
            self.session.commit()
        except Exception as e:
            raise e

    def atualizar_cliente(self, id_cliente, nome_cliente, cnpj_cliente, tipo_cliente, exames_incluidos):
        try:
            cliente_a_atualizar = self.filtrar_por_id(id_cliente=id_cliente)

            if nome_cliente is not None and nome_cliente != "":
                cliente_a_atualizar.nome_cliente = nome_cliente

            if cnpj_cliente is not None and cnpj_cliente != "":
                cliente_a_atualizar.cnpj_cliente = cnpj_cliente

            if tipo_cliente is not None and tipo_cliente != "":
                cliente_a_atualizar.tipo_cliente = tipo_cliente

            if exames_incluidos is not None:
                cliente_a_atualizar.exames_incluidos = exames_incluidos

            self.session.commit()
            return {
                "id_cliente": cliente_a_atualizar.id_cliente,
                "nome_cliente": cliente_a_atualizar.nome_cliente,
                "cnpj_cliente": cliente_a_atualizar.cnpj_cliente,
                "tipo_cliente": cliente_a_atualizar.tipo_cliente.__str__(),
                "exames_incluidos": cliente_a_atualizar.exames_incluidos,
            }
        except Exception as e:
            self.session.rollback()
            raise e
