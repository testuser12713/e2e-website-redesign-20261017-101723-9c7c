"""Authentication helpers: password hashing and cookie-based sessions."""

import hashlib
import os
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any
from urllib.parse import urlsplit

import bcrypt
from fastapi import Cookie, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session as DatabaseSession

from app.db import get_db
from app.models import Session, User, utc_now

SESSION_COOKIE_NAME = "equicrew_session"
DEFAULT_SESSION_TTL_HOURS = 8
SESSION_TOKEN_BYTES = 32
BCRYPT_MAX_PASSWORD_BYTES = 72

AUTH_REQUIRED_DETAIL = "Anmeldung erforderlich."
INVALID_CREDENTIALS_DETAIL = "E-Mail-Adresse oder Passwort ist falsch."


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


def _origin_site(origin: str) -> tuple[str, str] | None:
    """Return the scheme and host of an origin, or None when it is not a URL."""
    try:
        parts = urlsplit(origin)
    except ValueError:
        return None
    if not parts.scheme or not parts.hostname:
        return None
    return parts.scheme.lower(), parts.hostname.lower()


def session_cookie_attributes(
    origin: str | None, request_scheme: str, request_host: str | None
) -> dict[str, Any]:
    """Pick cookie flags that let the session survive a cross-site browser/API split.

    A browser fetches the API from the public frontend's page, so the cookie is
    only sent back when both ends count as the same site. When the page origin
    and the API host differ (``localhost`` vs ``127.0.0.1``, or http vs https),
    the browser treats the request as cross-site: a ``SameSite=Lax`` cookie is
    stored but never sent on the follow-up request, so the session looks empty.
    Such a cookie needs ``SameSite=None`` and, because browsers only accept that
    combination, the ``Secure`` flag. Loopback hosts are treated as secure
    contexts, so this also works for the local development setup over http.
    """
    same_site = True
    if origin:
        parsed = _origin_site(origin)
        if parsed is not None and request_host:
            origin_scheme, origin_host = parsed
            same_site = (
                origin_scheme == request_scheme.lower() and origin_host == request_host.lower()
            )
    cross_site = not same_site
    return {
        "httponly": True,
        "samesite": "none" if cross_site else "lax",
        "secure": cross_site,
        "path": "/",
    }


def as_utc(value: datetime) -> datetime:
    """Treat naive timestamps (as returned by SQLite) as UTC."""
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def hash_password(password: str) -> str:
    """Return a bcrypt hash of the plaintext password."""
    encoded = password.encode("utf-8")
    if len(encoded) > BCRYPT_MAX_PASSWORD_BYTES:
        raise ValueError(
            f"passwords must not exceed {BCRYPT_MAX_PASSWORD_BYTES} bytes when UTF-8 encoded"
        )
    return bcrypt.hashpw(encoded, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Check a plaintext password against a stored bcrypt hash."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (TypeError, ValueError):
        return False


def hash_session_token(token: str) -> str:
    """Hash a session token before it is stored or looked up."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_session(db: DatabaseSession, user: User) -> str:
    """Store a fresh server-side session for the account and return its token."""
    token = secrets.token_urlsafe(SESSION_TOKEN_BYTES)
    db.add(
        Session(
            token_hash=hash_session_token(token),
            user_id=user.id,
            expires_at=utc_now() + session_ttl(),
        )
    )
    db.commit()
    return token


def find_session(db: DatabaseSession, token: str) -> Session | None:
    """Return the stored session for a raw cookie token, if there is one."""
    if not token:
        return None
    return db.scalar(select(Session).where(Session.token_hash == hash_session_token(token)))


def delete_session(db: DatabaseSession, token: str | None) -> None:
    """Delete the session row belonging to a raw cookie token, if any."""
    if not token:
        return
    stored = find_session(db, token)
    if stored is not None:
        db.delete(stored)
        db.commit()


def normalize_email(email: str) -> str:
    """Normalize an address so lookups and duplicates are case-insensitive."""
    return email.strip().lower()


def authenticate(db: DatabaseSession, email: str, password: str) -> User | None:
    """Return the account matching the credentials, or None when they do not match."""
    normalized = normalize_email(email)
    if not normalized or not password:
        return None
    user = db.scalar(select(User).where(func.lower(User.email) == normalized))
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user


def require_user(
    equicrew_session: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    db: DatabaseSession = Depends(get_db),
) -> User:
    """Return the account behind the current session cookie or answer 401."""
    stored = find_session(db, equicrew_session or "")
    if stored is None:
        raise HTTPException(status_code=401, detail=AUTH_REQUIRED_DETAIL)

    if as_utc(stored.expires_at) <= utc_now():
        db.delete(stored)
        db.commit()
        raise HTTPException(status_code=401, detail=AUTH_REQUIRED_DETAIL)

    user = db.get(User, stored.user_id)
    if user is None:
        db.delete(stored)
        db.commit()
        raise HTTPException(status_code=401, detail=AUTH_REQUIRED_DETAIL)
    return user
