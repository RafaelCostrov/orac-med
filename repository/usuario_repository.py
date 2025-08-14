from sqlalchemy import func, and_
from model.usuario import Usuario
from db.db import Session


class UsuarioRepository:
    def __init__(self):
        self.session = Session

    def adicionar_usuario(self, usuario: Usuario):
        try:
            self.session.add(usuario)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            raise e

    def listar_todos_usuarios(self):
        try:
            usuarios = self.session.query(Usuario).all()
            return usuarios
        except Exception as e:
            raise e

    def filtrar_usuarios(self, id_usuario=None, nome_usuario=None, email_usuario=None, role=None, offset=None, limit=None,
                         order_by=None, order_dir=None):
        try:
            query = self.session.query(Usuario)
            total = query.count()
            filtros = []
            if id_usuario is not None:
                filtros.append(Usuario.id_usuario == id_usuario)
            if nome_usuario:
                filtros.append(func.lower(
                    Usuario.nome_usuario).like(f"%{nome_usuario}%"))
            if email_usuario:
                filtros.append(func.lower(
                    Usuario.email_usuario).like(f"%{email_usuario}%"))
            if role:
                filtros.append(func.lower(
                    Usuario.role).like(f"%{role}%"))

            query = query.filter(and_(*filtros))

            campos_permitidos = {
                "id_usuario": Usuario.id_usuario,
                "nome_usuario": Usuario.nome_usuario,
                "email_usuario": Usuario.email_usuario,
                "role": Usuario.role
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

    def filtrar_por_id(self, id_usuario):
        try:
            usuario = self.session.query(Usuario).filter(
                Usuario.id_usuario == id_usuario).first()
            return usuario
        except Exception as e:
            raise e

    def remover_usuario(self, id_usuario):
        try:
            usuario_a_remover = self.filtrar_por_id(id_usuario=id_usuario)
            self.session.delete(usuario_a_remover)
            self.session.commit()
        except Exception as e:
            raise e

    def atualizar_usuario(self, id_usuario, nome_usuario, email_usuario, role):
        try:
            usuario_a_atualizar = self.filtrar_por_id(id_usuario=id_usuario)

            if nome_usuario is not None and nome_usuario != "":
                usuario_a_atualizar.nome_usuario = nome_usuario

            if email_usuario is not None and email_usuario != "":
                usuario_a_atualizar.email_usuario = email_usuario

            if role is not None and role != "":
                usuario_a_atualizar.role = role

            self.session.commit()
            return {
                "id_usuario": usuario_a_atualizar.id_usuario,
                "nome_usuario": usuario_a_atualizar.nome_usuario,
                "email_usuario": usuario_a_atualizar.email_usuario,
                "role": usuario_a_atualizar.role.__str__(),
            }
        except Exception as e:
            self.session.rollback()
            raise e
