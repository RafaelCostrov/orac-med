from sqlalchemy import func, and_
from model.exame import Exame
from db.db import Session


class ExameRepository:
    def __init__(self):
        self.session = Session

    def adicionar_exame(self, exame: Exame):
        try:
            self.session.add(exame)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            raise e

    def listar_todos_exames(self):
        try:
            exames = self.session.query(Exame).all()
            return exames
        except Exception as e:
            raise e

    def filtrar_exames(self, id_exame=None, nome_exame=None, is_interno=None, min_valor=None, max_valor=None, offset=None, limit=None,
                       order_by=None, order_dir=None):
        try:
            query = self.session.query(Exame)
            total = query.count()
            filtros = []

            if id_exame is not None:
                filtros.append(Exame.id_exame == id_exame)

            if nome_exame:
                filtros.append(func.lower(
                    Exame.nome_exame).like(f"%{nome_exame}%"))

            if is_interno is not None:
                filtros.append(Exame.is_interno == is_interno)

            if min_valor:
                filtros.append(Exame.valor_exame >= min_valor)

            if max_valor:
                filtros.append(Exame.valor_exame <= max_valor)

            query = query.filter(and_(*filtros))

            campos_permitidos = {
                "id_exame": Exame.id_exame,
                "nome_exame": Exame.nome_exame,
                "is_interno": Exame.is_interno,
                "valor_exame": Exame.valor_exame
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

    def filtrar_por_id(self, id_exame):
        try:
            exame = self.session.query(Exame).filter(
                Exame.id_exame == id_exame).first()
            return exame
        except Exception as e:
            raise e

    def remover_exame(self, id_exame):
        try:
            exame_a_remover = self.filtrar_por_id(id_exame=id_exame)
            self.session.delete(exame_a_remover)
            self.session.commit()
        except Exception as e:
            raise e

    def atualizar_exame(self, id_exame, nome_exame, is_interno, valor_exame):
        try:
            exame_a_atualizar = self.filtrar_por_id(id_exame=id_exame)

            if nome_exame is not None and nome_exame != "":
                exame_a_atualizar.nome_exame = nome_exame

            if is_interno is not None:
                exame_a_atualizar.is_interno = is_interno

            if valor_exame is not None:
                exame_a_atualizar.valor_exame = valor_exame

            self.session.commit()
            return {
                "id_exame": exame_a_atualizar.id_exame,
                "nome_exame": exame_a_atualizar.nome_exame,
                "valor_exame": exame_a_atualizar.valor_exame,
                "is_interno": exame_a_atualizar.is_interno
            }
        except Exception as e:
            self.session.rollback()
            raise e
