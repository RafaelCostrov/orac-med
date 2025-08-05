from sqlalchemy import Column, Integer, String, Enum
from enums.tipos_usuario import TiposUsuario
from db.db import Base


class Usuario(Base):
    __tablename__ = 'usuario'

    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    nome_usuario = Column(String(100))
    email_usuario = Column(String(100))
    senha = Column(String(100))
    role = Column(Enum(TiposUsuario))
