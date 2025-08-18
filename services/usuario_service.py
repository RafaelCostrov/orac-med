from model.usuario import Usuario
from repository.usuario_repository import UsuarioRepository
from enums.tipos_usuario import TiposUsuario
import json


class UsuarioService():
    repositorio = UsuarioRepository()

    def verificar_usuario(self, email_usuario: str, senha: str):
        usuarios, _, _ = self.repositorio.filtrar_usuarios(
            email_usuario=email_usuario)
        usuario = usuarios[0] if usuarios else None
        if usuario and usuario.checkar_senha(senha):
            return usuario
        return None

    def cadastrar_usuario(self, usuario: Usuario):
        self.repositorio.adicionar_usuario(usuario=usuario)

    def listar_todos_usuarios(self):
        usuarios = self.repositorio.listar_todos_usuarios()
        lista = []
        for usuario in usuarios:
            json_usuario = {
                "id_usuario": usuario.id_usuario,
                "nome_usuario": usuario.nome_usuario,
                "email_usuario": usuario.email_usuario,
                "role": usuario.role.__str__()
            }
            lista.append(json_usuario)
        return lista

    def filtrar_usuarios(self, id_usuario: int, nome_usuario: str,  email_usuario: str, role: TiposUsuario, por_pagina=50, pagina: int = 1,
                         order_by: str = "nome_usuario", order_dir: str = "desc"):
        if por_pagina is not None:
            offset = (pagina - 1) * por_pagina
        else:
            offset = None

        usuarios_filtrados, total, total_filtrado = self.repositorio.filtrar_usuarios(
            id_usuario=id_usuario,
            nome_usuario=nome_usuario,
            email_usuario=email_usuario,
            role=role,
            offset=offset,
            limit=por_pagina,
            order_by=order_by,
            order_dir=order_dir
        )
        lista_filtrada = []
        for usuario in usuarios_filtrados:
            json_usuario = {
                "id_usuario": usuario.id_usuario,
                "nome_usuario": usuario.nome_usuario,
                "email_usuario": usuario.email_usuario,
                "role": usuario.role.__str__(),
            }
            lista_filtrada.append(json_usuario)
        return {
            "usuarios": lista_filtrada,
            "total": total,
            "total_filtrado": total_filtrado
        }

    def remover_usuario(self, id_usuario):
        self.repositorio.remover_usuario(id_usuario=id_usuario)

    def atualizar_usuario(self, id_usuario, nome_usuario, email_usuario, role):
        usuario_atualizado = self.repositorio.atualizar_usuario(
            id_usuario=id_usuario,
            nome_usuario=nome_usuario,
            email_usuario=email_usuario,
            role=role
        )
        return usuario_atualizado
