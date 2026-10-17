# EquiCrew – Website und internes Anfragen-Postfach

EquiCrew ist ein moderner Webauftritt für equicrew – smarte energie · fair verteilte KI.
Die öffentliche Website besteht aus den fünf Seiten Start, EquiCube, Über uns, Kontakt und
Impressum. Über das Kontaktformular eingehende Anfragen werden dauerhaft in einer SQLite-Datenbank
gespeichert und sind anschließend in einem geschützten internen Bereich abrufbar. Dort lassen sich
Anfragen im Detail lesen und als gelesen oder erledigt markieren, damit keine Nachricht verloren
geht.

## Technik

- **Frontend:** React, TypeScript und Vite (Verzeichnis `frontend/`)
- **Backend:** Python, FastAPI, Pydantic und SQLAlchemy (Verzeichnis `backend/`)
- **Datenbank:** SQLite als Datei neben der Anwendung (`backend/equicrew.db`)
- **Tests:** pytest im Backend, Vitest im Frontend

## Voraussetzungen

- Python 3.13 oder neuer
- Node.js 20 oder neuer mit npm

## Installation

Die Abhängigkeiten beider Dienste werden getrennt installiert:

```bash
cd backend
python -m pip install -r requirements.txt

cd ../frontend
npm install
```

Alternativ installiert `./dev.sh` die Backend-Abhängigkeiten automatisch und führt `npm install`
im Frontend aus, bevor beide Dienste starten.

## Entwicklung starten

Ein einziges Kommando startet das komplette Produkt – API und Frontend gemeinsam:

```bash
./dev.sh
```

Danach sind erreichbar:

- Frontend: <http://localhost:5173>
- API: <http://localhost:8000>
- Health-Check: <http://localhost:8000/api/health>

`./dev.sh` bricht mit einer verständlichen Meldung ab, wenn Python fehlt. Existiert noch kein
`frontend/package.json`, startet es die API allein und weist darauf hin. Beendet wird beides mit
`Ctrl+C`.

Die beiden Dienste lassen sich auch einzeln starten:

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

```bash
cd frontend
npm run dev
```

Beim ersten Start legt die API die Datenbank mit allen Tabellen automatisch an.

## Produktion bauen

Das Frontend wird als statisches Paket gebaut:

```bash
cd frontend
npm ci
npm run build
```

Das fertige Paket liegt in `frontend/dist/` und wird von einem statischen Webserver ausgeliefert.
Die API läuft dauerhaft mit:

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Für den Produktivbetrieb müssen die untenstehenden Umgebungsvariablen gesetzt werden; insbesondere
`EQUICREW_FRONTEND_ORIGIN` muss die tatsächliche Adresse des ausgelieferten Frontends enthalten,
damit der Browser die API mit Sitzungs-Cookie aufrufen darf.

## Konfiguration

| Variable | Dienst | Standard | Bedeutung |
| --- | --- | --- | --- |
| `EQUICREW_DATABASE_URL` | API | `sqlite:///./equicrew.db` | SQLAlchemy-URL der Datenbank; die SQLite-Datei liegt relativ zum Arbeitsverzeichnis `backend/`. |
| `EQUICREW_FRONTEND_ORIGIN` | API | `http://localhost:5173` | Die eine erlaubte CORS-Origin des Frontends; Credentials sind aktiviert. |
| `EQUICREW_SESSION_TTL_HOURS` | API | `8` | Gültigkeitsdauer einer internen Anmeldung in Stunden. |
| `VITE_API_BASE_URL` | Frontend | `http://localhost:8000` | Basis-URL der API, die das Frontend anspricht. |

Die Werte für die Entwicklung stehen in `RUN.json`. Beim gemeinsamen Start über `./dev.sh` werden
die Standardwerte verwendet; für andere Ports oder Adressen die Variablen vor dem Start exportieren.

## Erste Anmeldung anlegen

Das erste Konto für den internen Bereich wird mit einem einmaligen Kommando angelegt:

```bash
cd backend
python -m app.create_admin --email admin@example.com --password "Ihr-sicheres-Passwort"
```

Das Passwort wird ausschließlich gehasht gespeichert. Das Kommando kann für weitere Konten
wiederholt werden.

## Demo-Daten einspielen

Das Seed-Kommando füllt Demo-Anfragen und einen Demo-Login in die Datenbank:

```bash
cd backend
python -m app.seed
```

Der Demo-Login für den internen Bereich lautet:

- **E-Mail:** `demo@equicrew.com`
- **Passwort:** `EquiCrew-Demo-2026`

## Nutzung

### Öffentliche Website

- `/` – Startseite mit Claim und Mission
- `/equicube` – Vorstellung von EquiCube mit Merkmalen und Vorteilen
- `/ueber-uns` – Team und Kontaktdaten
- `/kontakt` – Kontaktformular mit Vorname, Nachname, E-Mail und Nachricht
- `/impressum` – Impressum und rechtliche Angaben

Das Kontaktformular prüft die Eingaben erst, nachdem ein Feld berührt oder das Formular abgeschickt
wurde. Nach erfolgreichem Absenden erscheint „Danke für deine Nachricht!“, das Formular wird
geleert und die Anfrage ist dauerhaft gespeichert. Schlägt das Speichern fehl, bleiben die Eingaben
erhalten und eine erneute Sendung ist möglich.

### Interner Bereich

- `/intern/login` – Anmeldung mit E-Mail und Passwort
- `/intern` – Postfach mit allen Anfragen, neueste zuerst
- `/intern/anfragen/:id` – Detailansicht einer Anfrage

Ohne gültige Anmeldung leitet der interne Bereich auf die Anmeldeseite weiter. Die Liste zeigt
Name, E-Mail-Adresse, Eingangszeitpunkt, eine gekürzte Nachricht und den Status. In der
Detailansicht stehen alle übermittelten Felder; der Status lässt sich auf **Neu**, **Gelesen** oder
**Erledigt** setzen. Die Abmeldung beendet die Sitzung serverseitig. Sitzungen laufen nach der
konfigurierten Zeit automatisch ab.

## API

Alle Endpunkte liegen unter `/api` und sprechen JSON. Fehler antworten immer als
`{"detail": ...}`; Validierungsfehler als
`{"detail": [{"field": "email", "message": "..."}]}`, ohne Stacktrace.

### `GET /api/health`

Antwortet mit `200 {"status": "ok"}`.

### `POST /api/contact`

Legt eine Anfrage an. Alle Felder sind Pflichtfelder.

```json
{
  "first_name": "Maria",
  "last_name": "Muster",
  "email": "maria@example.com",
  "message": "Guten Tag, ich interessiere mich für EquiCube."
}
```

Antwort: `201 {"id": 1}`. Fehler: `422` bei feldbezogenen Validierungsfehlern, `429` bei zu vielen
Absendungen, `500` wenn das Speichern fehlschlägt.

### `POST /api/auth/login`

```json
{"email": "demo@equicrew.com", "password": "EquiCrew-Demo-2026"}
```

Antwort: `200 {"email": "demo@equicrew.com"}` und ein `Set-Cookie` für das HttpOnly-Sitzungscookie
`equicrew_session` (`SameSite=Lax`, `Path=/`). Bei unbekannter E-Mail-Adresse und bei falschem
Passwort antwortet die API mit demselben `401`-Fehlertext.

### `POST /api/auth/logout`

Antwort: `204` ohne Inhalt; Sitzung und Cookie werden entfernt.

### `GET /api/auth/me`

Antwort: `200 {"email": "demo@equicrew.com"}` für eine gültige Sitzung, sonst `401`.

### `GET /api/inquiries`

Antwort: `200` mit allen Anfragen, neueste zuerst:

```json
{
  "items": [
    {
      "id": 1,
      "first_name": "Maria",
      "last_name": "Muster",
      "email": "maria@example.com",
      "message_excerpt": "Guten Tag, ich interessiere mich …",
      "created_at": "2026-10-17T08:30:00+00:00",
      "status": "new"
    }
  ]
}
```

Ohne gültige Sitzung: `401`.

### `GET /api/inquiries/{id}`

Antwort: `200` mit allen Feldern einschließlich der vollständigen Nachricht:

```json
{
  "id": 1,
  "first_name": "Maria",
  "last_name": "Muster",
  "email": "maria@example.com",
  "message": "Guten Tag, ich interessiere mich für EquiCube.",
  "created_at": "2026-10-17T08:30:00+00:00",
  "status": "new"
}
```

Ohne gültige Sitzung: `401`; unbekannte ID: `404`.

### `PATCH /api/inquiries/{id}`

Ändert den Status einer Anfrage:

```json
{"status": "read"}
```

Erlaubt sind `new`, `read` und `done`. Antwort: `200` mit der aktualisierten Anfrage im Format von
`GET /api/inquiries/{id}`. Ohne gültige Sitzung: `401`; unbekannte ID: `404`.

## Tests

```bash
cd backend
python -m pytest
```

```bash
cd frontend
npm test
```

## Funktionen

- Fünf öffentliche Seiten in deutscher Sprache mit eigenem Seitentitel und eigener Meta-Description
- Responsives Layout von 360 Pixel Breite bis zum Desktop, per Tastatur bedienbar
- Kontaktformular mit feldbezogenen Validierungsmeldungen und Rate Limit
- Dauerhafte Speicherung jeder Anfrage in SQLite
- Interner Bereich mit Anmeldung, Sitzungs-Cookie, Abmeldung und Sitzungsablauf
- Postfach mit Statusanzeige (Neu, Gelesen, Erledigt) und Detailansicht
- Einmal-Kommando für das erste Konto sowie Seed-Kommando mit Demo-Anfragen und Demo-Login
- Gemeinsamer Entwicklungsstart über `./dev.sh`
