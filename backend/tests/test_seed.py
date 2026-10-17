"""Tests for the seed fixtures and for seeding a fresh, empty database."""

import os
import subprocess
import sys
from collections.abc import Iterator
from pathlib import Path

import pytest
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session, sessionmaker

from app.db import Base
from app.models import Inquiry, User
from app.security import hash_password, normalize_email, verify_password
from app.seed import (
    BACKEND_DIR,
    DEMO_EMAIL,
    DEMO_INQUIRIES,
    DEMO_PASSWORD,
    InquiryFixture,
    database_url,
    seed_database,
)

INQUIRY_STATUSES = ("new", "read", "done")


@pytest.fixture()
def session_factory(tmp_path: Path) -> Iterator[sessionmaker[Session]]:
    """A fresh, empty SQLite database outside the repository, with the schema."""
    engine = create_engine(
        f"sqlite:///{tmp_path / 'seed.db'}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    try:
        yield factory
    finally:
        engine.dispose()


def test_demo_account_uses_the_documented_credentials() -> None:
    assert DEMO_EMAIL == "demo@equicrew.com"
    assert DEMO_PASSWORD == "EquiCrew-Demo-2026"


def test_demo_inquiries_are_a_realistic_volume() -> None:
    assert 20 <= len(DEMO_INQUIRIES) <= 30


def test_demo_inquiries_cover_all_three_statuses() -> None:
    statuses = [fixture.status for fixture in DEMO_INQUIRIES]

    assert set(statuses) == set(INQUIRY_STATUSES)
    for status in INQUIRY_STATUSES:
        assert statuses.count(status) >= 2


def test_every_inquiry_has_a_stable_natural_key() -> None:
    keys = {(fixture.email.lower(), fixture.message) for fixture in DEMO_INQUIRIES}

    assert len(keys) == len(DEMO_INQUIRIES)
    for fixture in DEMO_INQUIRIES:
        assert isinstance(fixture, InquiryFixture)
        assert fixture.first_name.strip()
        assert fixture.last_name.strip()
        assert "@" in fixture.email


def test_every_message_is_long_enough_for_a_shortened_excerpt() -> None:
    for fixture in DEMO_INQUIRIES:
        assert len(fixture.message) > 200, fixture.email
        assert "\n" in fixture.message


def test_inquiries_are_spread_over_the_last_weeks() -> None:
    days = [fixture.days_ago for fixture in DEMO_INQUIRIES]

    assert min(days) >= 1
    assert max(days) >= 30
    assert len(set(days)) == len(days)


def test_demo_password_can_be_verified_against_the_security_hashing() -> None:
    password_hash = hash_password(DEMO_PASSWORD)

    assert password_hash != DEMO_PASSWORD
    assert verify_password(DEMO_PASSWORD, password_hash)


def test_one_seed_run_fills_a_fresh_empty_database(
    session_factory: sessionmaker[Session],
) -> None:
    with session_factory() as db:
        result = seed_database(db)

    assert result.account_created is True
    assert result.inquiries_created == len(DEMO_INQUIRIES)
    assert result.inquiries_created > 0

    with session_factory() as db:
        stored = db.scalar(select(func.count(Inquiry.id)))
        statuses = set(db.scalars(select(Inquiry.status)).all())
        account = db.scalar(
            select(User).where(func.lower(User.email) == normalize_email(DEMO_EMAIL))
        )

    assert stored == len(DEMO_INQUIRIES)
    assert statuses == set(INQUIRY_STATUSES)
    assert account is not None


def test_second_seed_run_adds_nothing_and_leaves_stored_rows_unchanged(
    session_factory: sessionmaker[Session],
) -> None:
    with session_factory() as db:
        seed_database(db)

    with session_factory() as db:
        before = db.scalars(select(Inquiry.id).order_by(Inquiry.id)).all()
        account = db.scalar(select(User).where(User.email == normalize_email(DEMO_EMAIL)))
        assert account is not None
        password_hash = account.password_hash

    with session_factory() as db:
        result = seed_database(db)

    assert result.account_created is False
    assert result.inquiries_created == 0

    with session_factory() as db:
        after = db.scalars(select(Inquiry.id).order_by(Inquiry.id)).all()
        account_after = db.scalar(select(User).where(User.email == normalize_email(DEMO_EMAIL)))

    assert after == before
    assert account_after is not None
    assert account_after.password_hash == password_hash


def test_relative_database_url_is_anchored_at_the_api_directory(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("EQUICREW_DATABASE_URL", "sqlite:///./equicrew.db")

    assert database_url() == f"sqlite:///{(BACKEND_DIR / 'equicrew.db').as_posix()}"


def test_absolute_database_url_is_kept(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    configured = f"sqlite:///{tmp_path / 'custom.db'}"
    monkeypatch.setenv("EQUICREW_DATABASE_URL", configured)

    assert database_url() == configured


def test_documented_seed_command_fills_the_database_from_any_directory(tmp_path: Path) -> None:
    database = tmp_path / "fresh.db"
    env = {**os.environ, "EQUICREW_DATABASE_URL": f"sqlite:///{database}"}

    first = subprocess.run(
        [sys.executable, "-m", "app.seed"],
        cwd=tmp_path,
        env={**env, "PYTHONPATH": str(BACKEND_DIR)},
        capture_output=True,
        text=True,
    )
    second = subprocess.run(
        [sys.executable, "-m", "app.seed"],
        cwd=tmp_path,
        env={**env, "PYTHONPATH": str(BACKEND_DIR)},
        capture_output=True,
        text=True,
    )

    assert first.returncode == 0, first.stderr
    assert f"Added {len(DEMO_INQUIRIES)} demo inquiries." in first.stdout
    assert second.returncode == 0, second.stderr
    assert "Added 0 demo inquiries." in second.stdout

    engine = create_engine(f"sqlite:///{database}")
    try:
        with Session(engine) as db:
            assert db.scalar(select(func.count(Inquiry.id))) == len(DEMO_INQUIRIES)
            assert set(db.scalars(select(Inquiry.status)).all()) == set(INQUIRY_STATUSES)
    finally:
        engine.dispose()
