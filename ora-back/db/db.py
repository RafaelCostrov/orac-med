from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

Base = declarative_base()

SENHA_BD = os.getenv("SENHA_BD")

engine = create_engine(
    f"mysql+mysqlconnector://costrov:{SENHA_BD}@localhost/orac_med"
)
Session = sessionmaker(bind=engine)


Base.metadata.create_all(engine)
