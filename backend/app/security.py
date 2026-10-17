"""Authentication dependency shared by every protected API route."""

import os
from datetime import timedelta

from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.orm import Session as DatabaseSession

from app.db import get_db
from app.models import User

SESSION_COOKIE_NAME = "equicrew_session"
DEFAULT_SESSION_TTL_HOURS = 8


def session_ttl() -> timedelta:
    """Read the configured session lifetime, rejecting values that cannot work."""
    raw = os.environ.get("EQUICREW_SESSION_TTL_HOURS", "").strip()
    if not raw:
        return timedelta(hours=DEFAULT_SESSION_TTL_HOURS)
    try:
        hours = int(raw)
    except ValueError:
        hours = 0
    if hours <= 0:
        raise RuntimeError(
            "EQUICREW_SESSION_TTL_HOURS must be a positive integer number of hours; "
            "it is declared in RUN.json for development."
        )
    return timedelta(hours=hours)


def require_user(
    equicrew_session: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    db: DatabaseSession = Depends(get_db),
) -> User:
    """Return the account behind the current session cookie.

    The session lookup is delivered by the authentication ticket; until then this
    dependency answers 501 Not Implemented explicitly.
    """
    raise HTTPException(status_code=501, detail="auth #9 implements this")
