#!/usr/bin/env bash
#
# Start the complete EquiCrew product for development: API and web frontend.
# Installs the backend and frontend dependencies first, then runs both services
# in the foreground until this script is stopped with Ctrl+C.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PYTHON_BIN="${PYTHON:-python3}"
if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
    PYTHON_BIN="python"
fi
if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
    echo "Python 3 was not found. Install it and/or set PYTHON to its executable." >&2
    exit 1
fi

API_PORT="${API_PORT:-8000}"
WEB_PORT="${WEB_PORT:-5173}"

export EQUICREW_FRONTEND_ORIGIN="${EQUICREW_FRONTEND_ORIGIN:-http://localhost:${WEB_PORT}}"
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://localhost:${API_PORT}}"

echo "Installing API dependencies..."
"$PYTHON_BIN" -m pip install -q -r backend/requirements.txt

pids=()
cleanup() {
    for pid in "${pids[@]:-}"; do
        if [ -n "$pid" ]; then
            kill "$pid" 2>/dev/null || true
        fi
    done
}
trap cleanup EXIT INT TERM

echo "Starting API on http://localhost:${API_PORT} ..."
(
    cd backend
    exec "$PYTHON_BIN" -m uvicorn app.main:app --host 0.0.0.0 --port "$API_PORT"
) &
pids+=("$!")

if [ -f frontend/package.json ]; then
    echo "Installing web dependencies..."
    (
        cd frontend
        npm install --no-audit --no-fund
    )
    echo "Starting web frontend on http://localhost:${WEB_PORT} ..."
    (
        cd frontend
        exec npm run dev -- --port "$WEB_PORT"
    ) &
    pids+=("$!")
else
    echo "frontend/package.json not found - starting the API only." >&2
fi

wait
