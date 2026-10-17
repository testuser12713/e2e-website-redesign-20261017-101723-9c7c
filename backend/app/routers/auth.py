"""Router for internal sign-in, sign-out and the current account."""

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlalchemy.orm import Session as DatabaseSession

from app.db import get_db
from app.models import User
from app.schemas import LoginPayload, MeOut
from app.security import (
    INVALID_CREDENTIALS_DETAIL,
    SESSION_COOKIE_NAME,
    authenticate,
    create_session,
    delete_session,
    require_user,
    session_ttl,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=MeOut)
def login(
    payload: LoginPayload,
    response: Response,
    db: DatabaseSession = Depends(get_db),
) -> MeOut:
    """Verify credentials, open a server-side session and set its cookie."""
    user = authenticate(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(status_code=401, detail=INVALID_CREDENTIALS_DETAIL)

    token = create_session(db, user)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=int(session_ttl().total_seconds()),
        httponly=True,
        samesite="lax",
        path="/",
    )
    return MeOut(email=user.email)


@router.post("/logout", status_code=204)
def logout(
    equicrew_session: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    db: DatabaseSession = Depends(get_db),
) -> Response:
    """Delete the current session row and clear its cookie."""
    delete_session(db, equicrew_session)

    response = Response(status_code=204)
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
        httponly=True,
        samesite="lax",
    )
    return response


@router.get("/me", response_model=MeOut)
def me(user: User = Depends(require_user)) -> MeOut:
    """Return the signed-in account."""
    return MeOut(email=user.email)
