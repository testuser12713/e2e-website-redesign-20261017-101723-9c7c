"""Router for the protected inquiry inbox."""

from fastapi import APIRouter, Depends, HTTPException

from app.schemas import InquiryDetail, InquiryList, StatusUpdate
from app.security import require_user

router = APIRouter(
    prefix="/api/inquiries",
    tags=["inquiries"],
    dependencies=[Depends(require_user)],
)


@router.get("", response_model=InquiryList)
def list_inquiries() -> InquiryList:
    """Return every inquiry, newest first.

    Implemented by the inquiry endpoints ticket; answers 501 until then.
    """
    raise HTTPException(status_code=501, detail="inquiries #12 implements this")


@router.get("/{id}", response_model=InquiryDetail)
def get_inquiry(id: int) -> InquiryDetail:
    """Return one inquiry with its complete message.

    Implemented by the inquiry endpoints ticket; answers 501 until then.
    """
    raise HTTPException(status_code=501, detail="inquiries #12 implements this")


@router.patch("/{id}", response_model=InquiryDetail)
def update_inquiry_status(id: int, payload: StatusUpdate) -> InquiryDetail:
    """Change an inquiry's status.

    Implemented by the inquiry endpoints ticket; answers 501 until then.
    """
    raise HTTPException(status_code=501, detail="inquiries #12 implements this")
