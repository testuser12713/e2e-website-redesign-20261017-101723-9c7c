"""Entry point of the EquiCrew API."""

import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.errors import register_exception_handlers
from app.routers import auth, contact, inquiries
from app.security import session_ttl

DEFAULT_FRONTEND_ORIGIN = "http://localhost:5173"


def frontend_origin() -> str:
    """Return the single allowed CORS origin, with a development fallback."""
    raw = os.environ.get("EQUICREW_FRONTEND_ORIGIN", "").strip()
    if not raw or "${" in raw:
        return DEFAULT_FRONTEND_ORIGIN
    return raw.rstrip("/")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Create the schema and validate configuration before serving requests."""
    session_ttl()
    frontend_origin()
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="EquiCrew API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)


@app.get("/api/health", tags=["health"])
def health() -> dict[str, str]:
    """Report that the API is up."""
    return {"status": "ok"}


app.include_router(contact.router)
app.include_router(auth.router)
app.include_router(inquiries.router)
