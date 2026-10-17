"""Router for internal sign-in, sign-out and the current account."""

from fastapi import APIRouter, Depends, HTTPException

from app.schemas import LoginPayload, MeOut
from app.security import require_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=MeOut)
def login(payload: LoginPayload) -> MeOut:
    """Verify credentials and open a session.

    Implemented by the authentication ticket; answers 501 until then.
    """
    raise HTTPException(status_code=501, detail="auth #9 implements this")


@router.post("/logout", status_code=204)
def logout() -> None:
    """End the current session and clear its cookie.

    Implemented by the authentication ticket; answers 501 until then.
    """
    raise HTTPException(status_code=501, detail="auth #9 implements this")


@router.get("/me", response_model=MeOut, dependencies=[Depends(require_user)])
def me() -> MeOut:
    """Return the signed-in account.

    Implemented by the authentication ticket; answers 501 until then.
    """
    raise HTTPException(status_code=501, detail="auth #9 implements this")
