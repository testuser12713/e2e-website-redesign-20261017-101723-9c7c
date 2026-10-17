"""Database engine, session factory and declarative base for the EquiCrew API."""

import os
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DEFAULT_DATABASE_URL = "sqlite:///./equicrew.db"


def database_url() -> str:
    """Return the configured database URL, falling back to the bundled SQLite file."""
    raw = os.environ.get("EQUICREW_DATABASE_URL", "").strip()
    if not raw or "${" in raw:
        return DEFAULT_DATABASE_URL
    return raw


def _create_engine(url: str) -> Engine:
    options: dict[str, object] = {"pool_pre_ping": True}
    if url.startswith("sqlite"):
        options["connect_args"] = {"check_same_thread": False}
    return create_engine(url, **options)


engine = _create_engine(database_url())
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Declarative base shared by every ORM model."""


def get_db() -> Generator[Session]:
    """FastAPI dependency yielding a database session and closing it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
