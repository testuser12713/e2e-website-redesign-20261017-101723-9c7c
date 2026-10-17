"""Exception handlers that keep every API error in the agreed JSON shape."""

import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("equicrew.api")

_LOCATION_PREFIXES = {"body", "query", "path", "header", "cookie"}


def _field_name(location: tuple[Any, ...] | list[Any]) -> str:
    parts = [str(part) for part in location if str(part) not in _LOCATION_PREFIXES]
    return ".".join(parts) if parts else "body"


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Turn Pydantic validation errors into field-addressed 422 responses."""
    detail = [
        {
            "field": _field_name(error.get("loc", ())),
            "message": str(error.get("msg", "Invalid value")),
        }
        for error in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": detail})


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Log unexpected failures and answer with a plain 500 without a stack trace."""
    logger.exception("Unhandled error while handling %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


def register_exception_handlers(app: FastAPI) -> None:
    """Attach the API's exception handlers to the application."""
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
