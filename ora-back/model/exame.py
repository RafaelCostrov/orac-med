from sqlalchemy import Column, Integer, String, Float, Boolean
from db.db import Base


class Exame(Base):
    __tablename__ = 'exame'

    id_exame = Column(Integer, primary_key=True, autoincrement=True)
    nome_exame = Column(String(100))
    is_interno = Column(Boolean)
    valor_exame = Column(Float)
