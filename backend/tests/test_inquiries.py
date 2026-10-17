"""Tests for the protected inquiry list, detail and status endpoints."""

import importlib
import os
import tempfile
from collections.abc import Generator
from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

_TEMP_DIR = tempfile.mkdtemp(prefix="equicrew-inquiries-")
os.environ.setdefault(
    "EQUICREW_DATABASE_URL", f"sqlite:///{os.path.join(_TEMP_DIR, 'inquiries.db')}"
)

_db = importlib.import_module("app.db")
_main = importlib.import_module("app.main")
_models = importlib.import_module("app.models")
_security = importlib.import_module("app.security")
_inquiries = importlib.import_module("app.routers.inquiries")

Base = _db.Base
get_db = _db.get_db
app = _main.app
Inquiry = _models.Inquiry
User = _models.User
EXCERPT_LENGTH = _inquiries.EXCERPT_LENGTH
EXCERPT_ELLIPSIS = _inquiries.EXCERPT_ELLIPSIS

EMAIL = "inbox@example.com"
PASSWORD = "Inbox-Review-2026"


def reset_database(engine) -> None:
    """Create the schema for the throwaway database this module owns."""
    Base.metadata.create_all(bind=engine)


@pytest.fixture()
def inbox(
    tmp_path,
) -> Generator[tuple[TestClient, sessionmaker]]:
    """A client signed in against an isolated temporary SQLite database."""
    engine = create_engine(
        f"sqlite:///{tmp_path / 'inquiries.db'}",
        connect_args={"check_same_thread": False},
    )
    session_factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    reset_database(engine)

    def override_get_db() -> Generator[Session]:
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with session_factory() as db:
        db.add(User(email=EMAIL, password_hash=_security.hash_password(PASSWORD)))
        db.commit()

    with TestClient(app) as client:
        response = client.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
        assert response.status_code == 200
        yield client, session_factory

    app.dependency_overrides.clear()
    engine.dispose()


def add_inquiry(
    session_factory: sessionmaker,
    *,
    first_name: str,
    last_name: str = "Muster",
    email: str = "maria@example.com",
    message: str,
    created_at: datetime,
    status: str = "new",
) -> int:
    """Store an inquiry directly so ordering and timestamps are deterministic."""
    with session_factory() as db:
        inquiry = Inquiry(
            first_name=first_name,
            last_name=last_name,
            email=email,
            message=message,
            created_at=created_at,
            status=status,
        )
        db.add(inquiry)
        db.commit()
        return inquiry.id


def test_list_returns_newest_first_with_excerpts(
    inbox: tuple[TestClient, sessionmaker],
) -> None:
    client, session_factory = inbox
    older = add_inquiry(
        session_factory,
        first_name="Older",
        message="Kurze Nachricht",
        created_at=datetime(2026, 10, 15, 8, 0, tzinfo=UTC),
    )
    newest = add_inquiry(
        session_factory,
        first_name="Newest",
        message="Lange Nachricht " * 40,
        created_at=datetime(2026, 10, 17, 9, 30, tzinfo=UTC),
        status="read",
    )
    middle = add_inquiry(
        session_factory,
        first_name="Middle",
        message="Mittlere Nachricht",
        created_at=datetime(2026, 10, 16, 12, 0, tzinfo=UTC),
    )

    response = client.get("/api/inquiries")

    assert response.status_code == 200
    items = response.json()["items"]
    assert [item["id"] for item in items] == [newest, middle, older]
    assert [item["first_name"] for item in items] == ["Newest", "Middle", "Older"]
    assert items[0]["email"] == "maria@example.com"
    assert items[0]["status"] == "read"
    assert items[1]["status"] == "new"
    assert items[0]["created_at"] == "2026-10-17T09:30:00+00:00"

    short_excerpt = items[2]["message_excerpt"]
    assert short_excerpt == "Kurze Nachricht"

    long_excerpt = items[0]["message_excerpt"]
    assert long_excerpt.endswith(EXCERPT_ELLIPSIS)
    assert len(long_excerpt) <= EXCERPT_LENGTH + len(EXCERPT_ELLIPSIS)


def test_every_endpoint_answers_401_without_a_session(
    inbox: tuple[TestClient, sessionmaker],
) -> None:
    _, session_factory = inbox
    inquiry_id = add_inquiry(
        session_factory,
        first_name="Maria",
        message="Guten Tag",
        created_at=datetime(2026, 10, 17, 8, 0, tzinfo=UTC),
    )

    with TestClient(app) as anonymous:
        listing = anonymous.get("/api/inquiries")
        detail = anonymous.get(f"/api/inquiries/{inquiry_id}")
        update = anonymous.patch(f"/api/inquiries/{inquiry_id}", json={"status": "done"})

    assert listing.status_code == 401
    assert detail.status_code == 401
    assert update.status_code == 401


def test_detail_returns_the_full_message_and_received_timestamp(
    inbox: tuple[TestClient, sessionmaker],
) -> None:
    client, session_factory = inbox
    message = "Guten Tag, ich interessiere mich für EquiCube.\nBitte um Rückruf."
    inquiry_id = add_inquiry(
        session_factory,
        first_name="Maria",
        last_name="Muster",
        email="maria@example.com",
        message=message,
        created_at=datetime(2026, 10, 17, 8, 30, tzinfo=UTC),
    )

    response = client.get(f"/api/inquiries/{inquiry_id}")

    assert response.status_code == 200
    assert response.json() == {
        "id": inquiry_id,
        "first_name": "Maria",
        "last_name": "Muster",
        "email": "maria@example.com",
        "message": message,
        "created_at": "2026-10-17T08:30:00+00:00",
        "status": "new",
    }


def test_unknown_id_answers_404(
    inbox: tuple[TestClient, sessionmaker],
) -> None:
    client, _ = inbox

    detail = client.get("/api/inquiries/999999")
    update = client.patch("/api/inquiries/999999", json={"status": "done"})

    assert detail.status_code == 404
    assert update.status_code == 404
    assert detail.json()["detail"]
    assert update.json()["detail"]


def test_status_change_is_persisted_and_reflected_in_the_list(
    inbox: tuple[TestClient, sessionmaker],
) -> None:
    client, session_factory = inbox
    inquiry_id = add_inquiry(
        session_factory,
        first_name="Maria",
        message="Guten Tag",
        created_at=datetime(2026, 10, 17, 8, 0, tzinfo=UTC),
    )

    marked_read = client.patch(f"/api/inquiries/{inquiry_id}", json={"status": "read"})
    assert marked_read.status_code == 200
    assert marked_read.json()["status"] == "read"
    assert client.get("/api/inquiries").json()["items"][0]["status"] == "read"

    marked_done = client.patch(f"/api/inquiries/{inquiry_id}", json={"status": "done"})
    assert marked_done.status_code == 200
    assert marked_done.json()["status"] == "done"
    assert client.get("/api/inquiries").json()["items"][0]["status"] == "done"

    with session_factory() as fresh_db:
        stored = fresh_db.scalar(select(Inquiry).where(Inquiry.id == inquiry_id))
    assert stored is not None
    assert stored.status == "done"


def test_patch_rejects_a_status_outside_the_contract(
    inbox: tuple[TestClient, sessionmaker],
) -> None:
    client, session_factory = inbox
    inquiry_id = add_inquiry(
        session_factory,
        first_name="Maria",
        message="Guten Tag",
        created_at=datetime(2026, 10, 17, 8, 0, tzinfo=UTC),
    )

    response = client.patch(f"/api/inquiries/{inquiry_id}", json={"status": "archived"})

    assert response.status_code == 422
    assert client.get("/api/inquiries").json()["items"][0]["status"] == "new"
