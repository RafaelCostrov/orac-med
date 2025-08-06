from sqlalchemy import Column, Integer, String, Enum, Table, ForeignKey, DateTime, Boolean, Float
from sqlalchemy.orm import relationship
from enums.tipos_atendimento import TiposAtendimento
from db.db import Base


atendimento_exame = Table(
    'atendimento_exame',
    Base.metadata,
    Column('id_atendimento', Integer, ForeignKey(
        'atendimento.id_atendimento'), primary_key=True),
    Column('id_exame', Integer, ForeignKey('exame.id_exame'), primary_key=True)
)


class Atendimento(Base):
    __tablename__ = 'atendimento'

    id_atendimento = Column(Integer, primary_key=True, autoincrement=True)
    data_atendimento = Column(DateTime)
    tipo_atendimento = Column(Enum(TiposAtendimento))
    usuario = Column(String(100))
    valor = Column(Float)
    colaborador_atendimento = Column(String(100))
    is_ativo = Column(Boolean)
    id_cliente = Column(Integer, ForeignKey('cliente.id_cliente'))
    cliente_atendimento = relationship(
        "Cliente", backref="atendimento")
    exames_atendimento = relationship(
        "Exame", secondary=atendimento_exame, backref="atendimento")
