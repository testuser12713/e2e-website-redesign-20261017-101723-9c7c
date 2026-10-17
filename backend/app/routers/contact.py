"""Router for the public contact form."""

import logging
import re
import time
from threading import Lock

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Inquiry
from app.schemas import ContactPayload

logger = logging.getLogger("equicrew.api")

router = APIRouter(prefix="/api/contact", tags=["contact"])

NAME_MAX_LENGTH = 120
EMAIL_MAX_LENGTH = 320
MESSAGE_MAX_LENGTH = 5000

RATE_LIMIT_MAX_SUBMISSIONS = 5
RATE_LIMIT_WINDOW_SECONDS = 10 * 60

_EMAIL_PATTERN = re.compile(r"[^@\s]+@[^@\s]+\.[^@\s]+")

_rate_limit_hits: dict[str, list[float]] = {}
_rate_limit_lock = Lock()


def reset_rate_limit() -> None:
    """Forget every recorded submission (used by tests and after a restart)."""
    with _rate_limit_lock:
        _rate_limit_hits.clear()


def _client_key(request: Request) -> str:
    """Identify the submitting client by its IP address."""
    client = request.client
    return client.host if client is not None else "unknown"


def _is_rate_limited(key: str) -> bool:
    """Return whether the client already used up its submissions in the window."""
    now = time.monotonic()
    with _rate_limit_lock:
        hits = [
            hit for hit in _rate_limit_hits.get(key, []) if now - hit < RATE_LIMIT_WINDOW_SECONDS
        ]
        _rate_limit_hits[key] = hits
        return len(hits) >= RATE_LIMIT_MAX_SUBMISSIONS


def _record_submission(key: str) -> None:
    """Count one accepted submission for the client."""
    now = time.monotonic()
    with _rate_limit_lock:
        _rate_limit_hits.setdefault(key, []).append(now)


def _field_errors(payload: ContactPayload) -> list[dict[str, str]]:
    """Validate the payload independently of the frontend and list field errors."""
    errors: list[dict[str, str]] = []

    first_name = payload.first_name.strip()
    last_name = payload.last_name.strip()
    email = payload.email.strip()
    message = payload.message.strip()

    if not first_name:
        errors.append({"field": "first_name", "message": "Bitte gib deinen Vornamen ein."})
    elif len(first_name) > NAME_MAX_LENGTH:
        errors.append(
            {
                "field": "first_name",
                "message": f"Der Vorname darf höchstens {NAME_MAX_LENGTH} Zeichen lang sein.",
            }
        )

    if not last_name:
        errors.append({"field": "last_name", "message": "Bitte gib deinen Nachnamen ein."})
    elif len(last_name) > NAME_MAX_LENGTH:
        errors.append(
            {
                "field": "last_name",
                "message": f"Der Nachname darf höchstens {NAME_MAX_LENGTH} Zeichen lang sein.",
            }
        )

    if not email:
        errors.append({"field": "email", "message": "Bitte gib deine E-Mail-Adresse ein."})
    elif len(email) > EMAIL_MAX_LENGTH:
        errors.append(
            {
                "field": "email",
                "message": f"Die E-Mail-Adresse darf höchstens {EMAIL_MAX_LENGTH} Zeichen lang sein.",
            }
        )
    elif _EMAIL_PATTERN.fullmatch(email) is None:
        errors.append({"field": "email", "message": "Bitte gib eine gültige E-Mail-Adresse ein."})

    if not message:
        errors.append({"field": "message", "message": "Bitte gib eine Nachricht ein."})
    elif len(message) > MESSAGE_MAX_LENGTH:
        errors.append(
            {
                "field": "message",
                "message": f"Die Nachricht darf höchstens {MESSAGE_MAX_LENGTH} Zeichen lang sein.",
            }
        )

    return errors


@router.post("", status_code=201, response_model=None)
def submit_contact(
    payload: ContactPayload,
    request: Request,
    db: Session = Depends(get_db),
) -> dict[str, int]:
    """Validate and store a contact inquiry, rate limited per client address."""
    errors = _field_errors(payload)
    if errors:
        raise HTTPException(status_code=422, detail=errors)

    client_key = _client_key(request)
    if _is_rate_limited(client_key):
        raise HTTPException(
            status_code=429,
            detail="Zu viele Anfragen. Bitte versuche es später erneut.",
        )

    inquiry = Inquiry(
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        email=payload.email.strip(),
        message=payload.message.strip(),
        status="new",
    )
    try:
        db.add(inquiry)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Could not store a contact inquiry")
        raise HTTPException(status_code=500, detail="Internal Server Error") from None

    _record_submission(client_key)
    return {"id": inquiry.id}
