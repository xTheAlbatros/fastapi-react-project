"""Database engine and session factory"""
from __future__ import annotations

from typing import Generator

from sqlalchemy import text
from sqlalchemy.orm import Session, sessionmaker, declarative_base
from sqlalchemy import create_engine

from app.core.config import get_settings

settings = get_settings()

engine = create_engine(settings.sql_alchemy_uri, pool_pre_ping=True, future=True)

Base = declarative_base()

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields database session and ensures closing"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
