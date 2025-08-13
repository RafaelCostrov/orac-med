from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()
Base = declarative_base()

SENHA_BD = os.getenv("SENHA_BD")
DATABASE_URL = f"mysql+mysqlconnector://costrov:{SENHA_BD}@localhost/orac_med"

engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,
    pool_timeout=30,
)

SessionFactory = sessionmaker(
    bind=engine, autoflush=False, expire_on_commit=False)
Session = scoped_session(SessionFactory)

Base.metadata.create_all(engine)
