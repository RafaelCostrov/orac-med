from sqlalchemy import Column, Integer, String, Float, Boolean
from sqlalchemy.orm import declarative_base


Base = declarative_base()


class Exame(Base):
    __tablename__ = 'exame'

    id_exame = Column(Integer, primary_key=True, autoincrement=True)
    nome_exame = Column(String(100))
    is_interno = Column(Boolean)
    valor_exame = Column(Float)
