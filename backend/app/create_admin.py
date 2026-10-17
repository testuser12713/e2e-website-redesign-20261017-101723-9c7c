"""Create the first account for the internal inquiry inbox."""

import argparse
import sys
from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session as DatabaseSession

from app.db import Base, SessionLocal, engine
from app.models import User
from app.security import hash_password, normalize_email


class AdminCreationError(Exception):
    """Raised when an account cannot be created."""


def create_admin(db: DatabaseSession, email: str, password: str) -> User:
    """Create an internal account, refusing to overwrite an existing address."""
    normalized = normalize_email(email)
    if not normalized:
        raise AdminCreationError("An e-mail address is required.")

    existing = db.scalar(select(User).where(func.lower(User.email) == normalized))
    if existing is not None:
        raise AdminCreationError(
            f"An account for {normalized} already exists; it was left unchanged."
        )

    try:
        password_hash = hash_password(password)
    except ValueError as exc:
        raise AdminCreationError(str(exc)) from exc

    user = User(email=normalized, password_hash=password_hash)
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise AdminCreationError(
            f"An account for {normalized} already exists; it was left unchanged."
        ) from exc
    return user


def build_parser() -> argparse.ArgumentParser:
    """Build the command line parser for the one-time account command."""
    parser = argparse.ArgumentParser(
        prog="python -m app.create_admin",
        description="Create an account for the internal inquiry inbox.",
    )
    parser.add_argument("--email", required=True, help="E-mail address of the account")
    parser.add_argument("--password", required=True, help="Plaintext password of the account")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """Run the command and return its process exit code."""
    args = build_parser().parse_args(argv)
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        try:
            user = create_admin(db, args.email, args.password)
        except AdminCreationError as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 1

    print(f"Created internal account {user.email}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
