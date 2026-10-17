"""Tests for the public contact endpoint."""

from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from app.db import Base, get_db
from app.errors import register_exception_handlers
from app.models import Inquiry
from app.routers import contact

VALID_PAYLOAD: dict[str, str] = {
    "first_name": "Anna",
    "last_name": "Beispiel",
    "email": "anna.beispiel@example.com",
    "message": "Ich interessiere mich für EquiCube.",
}


@pytest.fixture(autouse=True)
def clear_rate_limit() -> Iterator[None]:
    """Give every test a fresh rate-limit window."""
    contact.reset_rate_limit()
    yield
    contact.reset_rate_limit()


@pytest.fixture()
def session_factory(tmp_path: Path) -> Iterator[sessionmaker[Session]]:
    """A throwaway SQLite database outside the repository, with the schema created."""
    engine = create_engine(
        f"sqlite:///{tmp_path / 'contact.db'}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    try:
        yield factory
    finally:
        engine.dispose()


@pytest.fixture()
def client(session_factory: sessionmaker[Session]) -> Iterator[TestClient]:
    """A test app wired to the throwaway database."""
    application = FastAPI()
    register_exception_handlers(application)

    def override_get_db() -> Iterator[Session]:
        session = session_factory()
        try:
            yield session
        finally:
            session.close()

    application.dependency_overrides[get_db] = override_get_db
    application.include_router(contact.router)

    with TestClient(application) as test_client:
        yield test_client


def test_accepted_submission_is_stored_and_readable_again(
    client: TestClient, session_factory: sessionmaker[Session]
) -> None:
    response = client.post("/api/contact", json=VALID_PAYLOAD)

    assert response.status_code == 201
    body = response.json()
    assert isinstance(body["id"], int)

    with session_factory() as session:
        stored = session.get(Inquiry, body["id"])
        assert stored is not None
        assert stored.first_name == "Anna"
        assert stored.last_name == "Beispiel"
        assert stored.email == "anna.beispiel@example.com"
        assert stored.message == "Ich interessiere mich für EquiCube."
        assert stored.status == "new"
        assert stored.created_at is not None


@pytest.mark.parametrize(
    ("override", "offending_field"),
    [
        ({"first_name": "   "}, "first_name"),
        ({"first_name": "x" * 121}, "first_name"),
        ({"last_name": "\t"}, "last_name"),
        ({"email": ""}, "email"),
        ({"email": "keine-adresse"}, "email"),
        ({"email": "x" * 321}, "email"),
        ({"message": " \n\t "}, "message"),
        ({"message": "x" * 5001}, "message"),
    ],
    ids=[
        "blank-first-name",
        "too-long-first-name",
        "blank-last-name",
        "blank-email",
        "malformed-email",
        "too-long-email",
        "blank-message",
        "too-long-message",
    ],
)
def test_invalid_input_reports_the_offending_field(
    client: TestClient,
    session_factory: sessionmaker[Session],
    override: dict[str, str],
    offending_field: str,
) -> None:
    payload = {**VALID_PAYLOAD, **override}

    response = client.post("/api/contact", json=payload)

    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, list)
    assert [item["field"] for item in detail].count(offending_field) == 1
    assert all(item["message"] for item in detail)

    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(Inquiry)) == 0


def test_missing_fields_are_reported_individually(client: TestClient) -> None:
    response = client.post("/api/contact", json={})

    assert response.status_code == 422
    detail = response.json()["detail"]
    assert {item["field"] for item in detail} == {
        "first_name",
        "last_name",
        "email",
        "message",
    }
    assert all(item["message"] for item in detail)


def test_sixth_submission_within_the_window_is_rate_limited(
    client: TestClient, session_factory: sessionmaker[Session]
) -> None:
    for index in range(5):
        response = client.post(
            "/api/contact",
            json={**VALID_PAYLOAD, "message": f"Nachricht Nummer {index}"},
        )
        assert response.status_code == 201

    response = client.post(
        "/api/contact",
        json={**VALID_PAYLOAD, "message": "Nachricht Nummer 6"},
    )

    assert response.status_code == 429
    assert response.json()["detail"]

    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(Inquiry)) == 5


def test_storage_failure_answers_500_and_stores_nothing(
    client: TestClient,
    session_factory: sessionmaker[Session],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def failing_commit(self: Session) -> None:
        raise SQLAlchemyError("simulated storage failure")

    monkeypatch.setattr(Session, "commit", failing_commit)

    response = client.post("/api/contact", json=VALID_PAYLOAD)

    assert response.status_code == 500
    assert response.json()["detail"] == "Internal Server Error"

    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(Inquiry)) == 0
