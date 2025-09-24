from sqlalchemy import Column, Integer, String, Enum
from enums.tipos_usuario import TiposUsuario
from werkzeug.security import generate_password_hash, check_password_hash
from db.db import Base


class Usuario(Base):
    __tablename__ = 'usuario'

    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    nome_usuario = Column(String(100))
    email_usuario = Column(String(100), unique=True, nullable=False)
    senha = Column(String(200))
    role = Column(Enum(TiposUsuario))
    foto_url = Column(String(200), nullable=True)

    def setar_senha(self, senha):
        self.senha = generate_password_hash(senha)

    def checkar_senha(self, senha):
        return check_password_hash(self.senha, senha)
