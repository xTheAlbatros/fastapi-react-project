"""Database schema creation and first-run setup"""
from __future__ import annotations

from sqlalchemy import text

from app.core.config import get_settings
from app.db.session import engine, Base
import app.db.models

def init_db() -> None:
    """Create schema and tables if they do not exist and set model schemas"""
    settings = get_settings()

    with engine.begin() as conn:
        conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {settings.DB_SCHEMA}"))

    for tbl in Base.metadata.tables.values():
        tbl.schema = settings.DB_SCHEMA

    Base.metadata.create_all(bind=engine)
