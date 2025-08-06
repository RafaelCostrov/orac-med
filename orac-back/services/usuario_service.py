from model.usuario import Usuario
from repository.usuario_repository import UsuarioRepository
import json


class UsuarioService():
    repositorio = UsuarioRepository()

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

    def filtrar_usuarios(self, id_usuario, nome_usuario,  email_usuario, role):
        usuarios_filtrados = self.repositorio.filtrar_usuarios(
            id_usuario=id_usuario,
            nome_usuario=nome_usuario,
            email_usuario=email_usuario,
            role=role,
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
        return lista_filtrada

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
