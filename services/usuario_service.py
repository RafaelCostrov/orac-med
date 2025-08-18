from model.usuario import Usuario
from repository.usuario_repository import UsuarioRepository
from enums.tipos_usuario import TiposUsuario
from services.google_services.envio_drive import salvar_drive, remover_drive
import os
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

    def cadastrar_usuario(self, nome_usuario: str,  email_usuario: str, role: TiposUsuario, senha: str, foto: str = None):
        usuario = Usuario(
            nome_usuario=nome_usuario,
            email_usuario=email_usuario,
            role=role
        )

        if foto:
            nome_arquivo = foto.filename
            os.makedirs("services\\temp_uploads", exist_ok=True)
            temp_path = os.path.join("services\\temp_uploads", nome_arquivo)
            foto.save(temp_path)
            foto_url = salvar_drive(
                temp_path, usuario.email_usuario, usuario.nome_usuario)
            usuario.foto_url = foto_url
            os.remove(temp_path)

        usuario.setar_senha(senha)
        self.repositorio.salvar(usuario=usuario)

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

    def atualizar_usuario(self, id_usuario, nome_usuario, email_usuario, senha, role, foto):
        usuario = self.repositorio.filtrar_por_id(id_usuario)

        if not usuario:
            raise Exception("Usuário não encontrado")

        if nome_usuario and nome_usuario.strip():
            usuario.nome_usuario = nome_usuario

        if email_usuario and email_usuario.strip():
            usuario.email_usuario = email_usuario

        if role:
            usuario.role = role

        if senha and senha.strip():
            usuario.setar_senha(senha)

        if foto:
            if usuario.foto_url:
                remover_drive(usuario.foto_url)
            nome_arquivo = foto.filename
            os.makedirs("services\\temp_uploads", exist_ok=True)
            temp_path = os.path.join("services\\temp_uploads", nome_arquivo)
            foto.save(temp_path)
            foto_url = salvar_drive(
                temp_path, usuario.email_usuario, usuario.nome_usuario)
            usuario.foto_url = foto_url
            os.remove(temp_path)

        self.repositorio.salvar(usuario)

        return {
            "id_usuario": usuario.id_usuario,
            "nome_usuario": usuario.nome_usuario,
            "email_usuario": usuario.email_usuario,
            "role": usuario.role.__str__(),
            "foto_url": usuario.foto_url
        }
