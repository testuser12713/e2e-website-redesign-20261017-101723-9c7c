"""Tests for password hashing, login sessions and the create-admin command."""

import importlib
import os
import tempfile
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete, func, select

_TEMP_DIR = tempfile.mkdtemp(prefix="equicrew-auth-")
os.environ.setdefault("EQUICREW_DATABASE_URL", f"sqlite:///{os.path.join(_TEMP_DIR, 'auth.db')}")

_create_admin = importlib.import_module("app.create_admin")
_db = importlib.import_module("app.db")
_main = importlib.import_module("app.main")
_models = importlib.import_module("app.models")
_security = importlib.import_module("app.security")

AdminCreationError = _create_admin.AdminCreationError
create_admin = _create_admin.create_admin
main = _create_admin.main
Base = _db.Base
SessionLocal = _db.SessionLocal
engine = _db.engine
app = _main.app
SessionRow = _models.Session
User = _models.User
utc_now = _models.utc_now
SESSION_COOKIE_NAME = _security.SESSION_COOKIE_NAME
hash_session_token = _security.hash_session_token
verify_password = _security.verify_password

EMAIL = "admin@example.com"
PASSWORD = "Correct-Horse-2026"


def reset_database() -> None:
    """Create the schema and empty the tables this ticket owns."""
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        db.execute(delete(SessionRow))
        db.execute(delete(User))
        db.commit()


@pytest.fixture()
def client() -> TestClient:
    """A test client with an empty account and session table."""
    reset_database()
    with TestClient(app) as test_client:
        yield test_client


def create_account(email: str = EMAIL, password: str = PASSWORD) -> User:
    """Create an internal account through the same helper the CLI uses."""
    with SessionLocal() as db:
        return create_admin(db, email, password)


def login(client: TestClient, email: str = EMAIL, password: str = PASSWORD):
    """Post the login payload with the test credentials."""
    return client.post("/api/auth/login", json={"email": email, "password": password})


def session_token_from(response) -> str:
    """Extract the raw session token from a login response's Set-Cookie header."""
    set_cookie = response.headers["set-cookie"]
    cookie_pair = set_cookie.split(";", 1)[0]
    return cookie_pair.split("=", 1)[1]


def test_password_is_stored_as_a_bcrypt_hash_of_the_plaintext(client: TestClient) -> None:
    create_account()

    with SessionLocal() as db:
        user = db.scalar(select(User).where(func.lower(User.email) == EMAIL))

    assert user is not None
    assert user.password_hash != PASSWORD
    assert user.password_hash.startswith("$2")
    assert verify_password(PASSWORD, user.password_hash)


def test_login_me_logout_flow(client: TestClient) -> None:
    create_account()

    anonymous = TestClient(app)
    assert anonymous.get("/api/auth/me").status_code == 401

    response = login(client)
    assert response.status_code == 200
    assert response.json() == {"email": EMAIL}

    set_cookie = response.headers["set-cookie"]
    assert f"{SESSION_COOKIE_NAME}=" in set_cookie
    assert "httponly" in set_cookie.lower()
    assert "samesite=lax" in set_cookie.lower()
    assert "path=/" in set_cookie.lower()

    token = session_token_from(response)
    with SessionLocal() as db:
        stored = db.scalar(
            select(SessionRow).where(SessionRow.token_hash == hash_session_token(token))
        )
    assert stored is not None
    assert stored.token_hash != token

    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json() == {"email": EMAIL}

    assert anonymous.get("/api/auth/me").status_code == 401

    logout = client.post("/api/auth/logout")
    assert logout.status_code == 204
    assert client.get("/api/auth/me").status_code == 401

    with TestClient(app) as reuse:
        reuse.cookies.set(SESSION_COOKIE_NAME, token)
        assert reuse.get("/api/auth/me").status_code == 401


def test_wrong_credentials_share_one_indistinguishable_response(client: TestClient) -> None:
    create_account()

    unknown_email = login(client, email="nobody@example.com", password=PASSWORD)
    wrong_password = login(client, email=EMAIL, password="Not-The-Password")

    assert unknown_email.status_code == 401
    assert wrong_password.status_code == 401
    assert unknown_email.json() == wrong_password.json()
    assert unknown_email.json()["detail"]


def test_unknown_session_cookie_is_rejected(client: TestClient) -> None:
    create_account()
    client.cookies.set(SESSION_COOKIE_NAME, "a-token-that-was-never-issued")

    assert client.get("/api/auth/me").status_code == 401


def test_expired_session_is_rejected_and_deleted(client: TestClient) -> None:
    user = create_account()
    token = "an-expired-session-token"
    token_hash = hash_session_token(token)

    with SessionLocal() as db:
        db.add(
            SessionRow(
                token_hash=token_hash,
                user_id=user.id,
                expires_at=utc_now() - timedelta(minutes=1),
            )
        )
        db.commit()

    client.cookies.set(SESSION_COOKIE_NAME, token)
    assert client.get("/api/auth/me").status_code == 401

    with SessionLocal() as db:
        assert db.scalar(select(SessionRow).where(SessionRow.token_hash == token_hash)) is None


def test_create_admin_creates_an_account_that_can_sign_in(client: TestClient) -> None:
    user = create_account()

    assert user.email == EMAIL
    assert user.password_hash != PASSWORD

    response = login(client)
    assert response.status_code == 200
    assert response.json() == {"email": EMAIL}


def test_create_admin_command_creates_a_usable_account(client: TestClient) -> None:
    exit_code = main(["--email", "cli@example.com", "--password", "Cli-Command-2026"])

    assert exit_code == 0
    response = login(client, email="cli@example.com", password="Cli-Command-2026")
    assert response.status_code == 200
    assert response.json() == {"email": "cli@example.com"}


def test_create_admin_refuses_a_duplicate_address(client: TestClient) -> None:
    create_account()

    with SessionLocal() as db:
        with pytest.raises(AdminCreationError) as error:
            create_admin(db, EMAIL.upper(), "A-Different-Password")
        assert "already exists" in str(error.value)

    with SessionLocal() as db:
        users = db.scalars(select(User).where(func.lower(User.email) == EMAIL)).all()

    assert len(users) == 1
    assert verify_password(PASSWORD, users[0].password_hash)
