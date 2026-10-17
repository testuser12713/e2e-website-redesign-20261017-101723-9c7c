"""Router for the protected inquiry inbox."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session as DatabaseSession

from app.db import get_db
from app.models import Inquiry
from app.schemas import InquiryDetail, InquiryList, InquirySummary, StatusUpdate
from app.security import require_user

router = APIRouter(
    prefix="/api/inquiries",
    tags=["inquiries"],
    dependencies=[Depends(require_user)],
)

EXCERPT_LENGTH = 160
EXCERPT_ELLIPSIS = "…"
INQUIRY_NOT_FOUND_DETAIL = "Anfrage nicht gefunden."


def message_excerpt(message: str) -> str:
    """Shorten a message for the inbox list without cutting mid-word."""
    text = message.strip()
    if len(text) <= EXCERPT_LENGTH:
        return text
    return text[:EXCERPT_LENGTH].rstrip() + EXCERPT_ELLIPSIS


def to_summary(inquiry: Inquiry) -> InquirySummary:
    """Build the inbox list shape from a stored inquiry."""
    return InquirySummary(
        id=inquiry.id,
        first_name=inquiry.first_name,
        last_name=inquiry.last_name,
        email=inquiry.email,
        message_excerpt=message_excerpt(inquiry.message),
        created_at=inquiry.created_at,
        status=inquiry.status,
    )


def get_or_404(db: DatabaseSession, inquiry_id: int) -> Inquiry:
    """Return the stored inquiry for an id or answer 404."""
    inquiry = db.get(Inquiry, inquiry_id)
    if inquiry is None:
        raise HTTPException(status_code=404, detail=INQUIRY_NOT_FOUND_DETAIL)
    return inquiry


@router.get("", response_model=InquiryList)
def list_inquiries(db: DatabaseSession = Depends(get_db)) -> InquiryList:
    """Return every inquiry, newest first."""
    rows = db.scalars(select(Inquiry).order_by(Inquiry.created_at.desc(), Inquiry.id.desc())).all()
    return InquiryList(items=[to_summary(inquiry) for inquiry in rows])


@router.get("/{id}", response_model=InquiryDetail)
def get_inquiry(id: int, db: DatabaseSession = Depends(get_db)) -> Inquiry:
    """Return one inquiry with its complete message."""
    return get_or_404(db, id)


@router.patch("/{id}", response_model=InquiryDetail)
def update_inquiry_status(
    id: int, payload: StatusUpdate, db: DatabaseSession = Depends(get_db)
) -> Inquiry:
    """Change an inquiry's status and return the updated record."""
    inquiry = get_or_404(db, id)
    inquiry.status = payload.status
    db.commit()
    return inquiry
