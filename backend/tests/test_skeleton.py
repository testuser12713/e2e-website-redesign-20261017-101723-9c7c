"""Tests for the backend skeleton: the health route and the declared API contract."""

import os

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def application(tmp_path_factory: pytest.TempPathFactory) -> FastAPI:
    """Import the app against a throwaway SQLite file outside the repository."""
    if not os.environ.get("EQUICREW_DATABASE_URL"):
        directory = tmp_path_factory.mktemp("database")
        os.environ["EQUICREW_DATABASE_URL"] = f"sqlite:///{directory / 'skeleton.db'}"

    from app.main import app

    return app


CONTRACT_OPERATIONS: dict[str, set[str]] = {
    "/api/health": {"get"},
    "/api/contact": {"post"},
    "/api/auth/login": {"post"},
    "/api/auth/logout": {"post"},
    "/api/auth/me": {"get"},
    "/api/inquiries": {"get"},
    "/api/inquiries/{id}": {"get", "patch"},
}


def test_health_reports_ok(application: FastAPI) -> None:
    with TestClient(application) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_openapi_lists_every_contract_path(application: FastAPI) -> None:
    paths = application.openapi()["paths"]

    for path, methods in CONTRACT_OPERATIONS.items():
        assert path in paths, f"contract path {path} is not registered"
        for method in methods:
            assert method in paths[path], f"{method.upper()} {path} is not registered"


def test_contract_paths_have_no_second_trailing_slash_spelling(application: FastAPI) -> None:
    paths = application.openapi()["paths"]

    for path in CONTRACT_OPERATIONS:
        assert f"{path}/" not in paths, f"{path}/ is a second spelling of {path}"


def test_validation_errors_report_each_missing_field(application: FastAPI) -> None:
    with TestClient(application) as client:
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


def test_cors_allows_the_configured_frontend_origin_with_credentials(application: FastAPI) -> None:
    from app.main import frontend_origin

    origin = frontend_origin()
    with TestClient(application) as client:
        response = client.get("/api/health", headers={"Origin": origin})

    assert response.headers["access-control-allow-origin"] == origin
    assert response.headers["access-control-allow-credentials"] == "true"
