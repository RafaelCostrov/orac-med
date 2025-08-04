from sqlalchemy import Column, Integer, String, Enum, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.orm import declarative_base
from enums.tipos_cliente import TiposCliente


Base = declarative_base()

cliente_exame = Table(
    'cliente_exame',
    Base.metadata,
    Column('id_cliente', Integer, ForeignKey(
        'cliente.id_cliente'), primary_key=True),
    Column('id_exame', Integer, ForeignKey('exame.id_exame'), primary_key=True)
)


class Cliente(Base):
    __tablename__ = 'cliente'

    id_cliente = Column(Integer, primary_key=True, autoincrement=True)
    nome_cliente = Column(String(100))
    tipo_cliente = Column(Enum(TiposCliente))
    exames_incluidos = relationship(
        "Exame", secondary=cliente_exame, backref="clientes")
