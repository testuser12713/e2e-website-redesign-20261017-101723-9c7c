"""Tests for the seed's record fixtures, without touching a database."""

from app.security import hash_password, verify_password
from app.seed import DEMO_EMAIL, DEMO_INQUIRIES, DEMO_PASSWORD, InquiryFixture

INQUIRY_STATUSES = ("new", "read", "done")


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
