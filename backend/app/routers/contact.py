"""Router for the public contact form."""

from fastapi import APIRouter, HTTPException

from app.schemas import ContactPayload

router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("", status_code=201, response_model=None)
def submit_contact(payload: ContactPayload) -> None:
    """Store a contact inquiry.

    Implemented by the contact endpoint ticket; answers 501 until then.
    """
    raise HTTPException(status_code=501, detail="contact #1 implements this")
