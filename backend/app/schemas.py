"""Pydantic models describing the JSON shapes of the public API contract."""

from datetime import UTC, datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, PlainSerializer

InquiryStatus = Literal["new", "read", "done"]


def _utc_isoformat(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=UTC)
    return value.astimezone(UTC).isoformat()


UtcTimestamp = Annotated[datetime, PlainSerializer(_utc_isoformat, return_type=str)]


class ContactPayload(BaseModel):
    """Fields submitted by the public contact form."""

    first_name: str
    last_name: str
    email: str
    message: str


class LoginPayload(BaseModel):
    """Credentials submitted by the internal sign-in form."""

    email: str
    password: str


class MeOut(BaseModel):
    """The signed-in account as returned by the auth endpoints."""

    email: str


class InquirySummary(BaseModel):
    """An inquiry as shown in the internal inbox list."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: str
    message_excerpt: str
    created_at: UtcTimestamp
    status: InquiryStatus


class InquiryDetail(BaseModel):
    """An inquiry with its complete message."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: str
    message: str
    created_at: UtcTimestamp
    status: InquiryStatus


class InquiryList(BaseModel):
    """The inbox payload: every inquiry, newest first."""

    items: list[InquirySummary]


class StatusUpdate(BaseModel):
    """Body of a request that changes an inquiry's status."""

    status: InquiryStatus
