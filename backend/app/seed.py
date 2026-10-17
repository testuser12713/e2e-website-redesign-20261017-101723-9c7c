"""Seed the database with a demo account and realistic demo inquiries.

The seed is idempotent: running it twice creates the demo account once and adds
only the demo inquiries that are not stored yet. It is never triggered at
startup and never from the test suite.
"""

import argparse
import sys
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session as DatabaseSession

from app.db import Base, SessionLocal, engine
from app.models import Inquiry, User
from app.security import hash_password, normalize_email

DEMO_EMAIL = "demo@equicrew.com"
DEMO_PASSWORD = "EquiCrew-Demo-2026"


@dataclass(frozen=True)
class InquiryFixture:
    """One demo inquiry with a stable natural key and a relative creation time."""

    first_name: str
    last_name: str
    email: str
    message: str
    status: str
    days_ago: int
    hours_ago: int = 0


DEMO_INQUIRIES: tuple[InquiryFixture, ...] = (
    InquiryFixture(
        first_name="Maria",
        last_name="Schneider",
        email="maria.schneider@example.com",
        message=(
            "Guten Tag EquiCrew-Team,\n\n"
            "wir planen für unsere mittelständische Fertigung den Einstieg in eine "
            "KI-gestützte Auswertung unserer Maschinendaten. Besonders interessiert uns, "
            "wie EquiCube ohne großen Integrationsaufwand an unsere bestehenden Anlagen "
            "angebunden werden kann. Können Sie uns in einem kurzen Gespräch die "
            "Möglichkeiten und den zeitlichen Rahmen erläutern?\n\n"
            "Viele Grüße\nMaria Schneider"
        ),
        status="new",
        days_ago=1,
        hours_ago=3,
    ),
    InquiryFixture(
        first_name="Jonas",
        last_name="Weber",
        email="jonas.weber@example.com",
        message=(
            "Hallo zusammen,\n\n"
            "ich habe Ihre Website über eine Empfehlung gefunden und würde gerne mehr "
            "über die faire Verteilung der Rechenressourcen in EquiCube erfahren. Unser "
            "Verein betreibt ein kleines Rechenzentrum und sucht nach einer transparenten "
            "Lösung, bei der alle Beteiligten nachvollziehen können, wie ihre Aufträge "
            "priorisiert werden.\n\n"
            "Beste Grüße\nJonas Weber"
        ),
        status="new",
        days_ago=2,
        hours_ago=7,
    ),
    InquiryFixture(
        first_name="Anja",
        last_name="Krüger",
        email="anja.krueger@example.com",
        message=(
            "Sehr geehrte Damen und Herren,\n\n"
            "wir sind ein Bildungsanbieter und möchten unsere Lernplattform mit einer "
            "smarten Energieüberwachung ergänzen. Der EquiCube klingt für uns vielversprechend, "
            "weil er lokal arbeitet und wir keine sensiblen Daten in die Cloud geben müssen. "
            "Gibt es eine Dokumentation zur technischen Anbindung und zu den "
            "Mindestanforderungen an die Hardware?\n\n"
            "Mit freundlichen Grüßen\nAnja Krüger"
        ),
        status="new",
        days_ago=3,
        hours_ago=1,
    ),
    InquiryFixture(
        first_name="Tobias",
        last_name="Lang",
        email="tobias.lang@example.com",
        message=(
            "Hallo EquiCrew,\n\n"
            "ich betreibe zuhause eine kleine Photovoltaikanlage mit Speicher und würde "
            "gerne verstehen, ob EquiCube die Erzeugung und den Verbrauch in Echtzeit "
            "gegenüberstellen kann. Schön wäre außerdem eine Empfehlung, wann sich das "
            "Einspeisen und wann der Eigenverbrauch eher lohnt. Gibt es dafür bereits "
            "eine Auswertung oder ist das geplant?\n\n"
            "Freundliche Grüße\nTobias Lang"
        ),
        status="new",
        days_ago=4,
        hours_ago=9,
    ),
    InquiryFixture(
        first_name="Sandra",
        last_name="Hoffmann",
        email="sandra.hoffmann@example.com",
        message=(
            "Guten Tag,\n\n"
            "unsere Stadtwerke prüfen derzeit verschiedene Lösungen für ein lokales "
            "Energiemanagement in einem Neubaugebiet. Wir haben Interesse an einer "
            "Präsentation von EquiCube, idealerweise mit einem Überblick über Referenzen "
            "und mögliche Betreibermodelle. Wären Sie in den nächsten Wochen für einen "
            "Termin offen?\n\n"
            "Freundliche Grüße\nSandra Hoffmann"
        ),
        status="new",
        days_ago=5,
        hours_ago=4,
    ),
    InquiryFixture(
        first_name="Michael",
        last_name="Braun",
        email="michael.braun@example.com",
        message=(
            "Hallo liebes Team,\n\n"
            "ich habe eine Frage zur Preisgestaltung. Wir sind ein kleines Ingenieurbüro "
            "mit acht Mitarbeitenden und würden EquiCube zunächst testweise einsetzen "
            "wollen. Gibt es eine kostenlose Testphase, und wie werden die Kosten später "
            "berechnet - pro Gerät, pro Nutzer oder nach Rechenleistung?\n\n"
            "Vielen Dank im Voraus\nMichael Braun"
        ),
        status="new",
        days_ago=6,
        hours_ago=2,
    ),
    InquiryFixture(
        first_name="Laura",
        last_name="Vogel",
        email="laura.vogel@example.com",
        message=(
            "Sehr geehrtes EquiCrew-Team,\n\n"
            "im Rahmen meiner Masterarbeit untersuche ich, wie sich KI-Modelle "
            "energieeffizienter betreiben lassen. EquiCube klingt nach einem spannenden "
            "Ansatz. Ich würde gerne wissen, ob es veröffentlichte Messwerte zum "
            "Energieverbrauch gibt und ob eine Zusammenarbeit im Rahmen eines "
            "Forschungspraktikums möglich wäre.\n\n"
            "Herzliche Grüße\nLaura Vogel"
        ),
        status="new",
        days_ago=8,
        hours_ago=5,
    ),
    InquiryFixture(
        first_name="Daniel",
        last_name="Fischer",
        email="daniel.fischer@example.com",
        message=(
            "Guten Morgen,\n\n"
            "wir setzen in unserer Produktion bereits mehrere Sensoren ein und möchten "
            "die anfallenden Daten künftig direkt vor Ort auswerten, statt sie an einen "
            "Cloud-Dienst zu übertragen. Dabei sind Latenz und Datenschutz entscheidend. "
            "Können Sie kurz erklären, welche Schnittstellen EquiCube mitbringt und ob "
            "eine Offline-Nutzung möglich ist?\n\n"
            "Beste Grüße\nDaniel Fischer"
        ),
        status="read",
        days_ago=9,
        hours_ago=11,
    ),
    InquiryFixture(
        first_name="Christina",
        last_name="Neumann",
        email="christina.neumann@example.com",
        message=(
            "Hallo,\n\n"
            "wir organisieren im Herbst eine Fachmesse zum Thema nachhaltige "
            "Digitalisierung und suchen noch Aussteller aus dem Bereich energieeffiziente "
            "KI. Ihr Produkt würde sehr gut zu unserem Programm passen. Ich würde Ihnen "
            "gerne die Konditionen zusenden, wenn Sie grundsätzlich Interesse an einer "
            "Teilnahme haben.\n\n"
            "Mit freundlichen Grüßen\nChristina Neumann"
        ),
        status="read",
        days_ago=11,
        hours_ago=6,
    ),
    InquiryFixture(
        first_name="Stefan",
        last_name="Richter",
        email="stefan.richter@example.com",
        message=(
            "Sehr geehrte Damen und Herren,\n\n"
            "wir haben kürzlich unsere Serverinfrastruktur erneuert und würden gerne "
            "prüfen, ob EquiCube sich in unsere bestehende Virtualisierungsumgebung "
            "einfügen lässt. Wichtig wären für uns eine Rolle für mehrere Mandanten sowie "
            "eine zentrale Auswertung über Standorte hinweg. Gibt es dazu bereits "
            "Erfahrungen?\n\n"
            "Mit freundlichen Grüßen\nStefan Richter"
        ),
        status="read",
        days_ago=12,
        hours_ago=3,
    ),
    InquiryFixture(
        first_name="Julia",
        last_name="Wolf",
        email="julia.wolf@example.com",
        message=(
            "Hallo EquiCrew,\n\n"
            "ich bin Architektin und betreue ein Projekt mit 24 Wohneinheiten, das "
            "möglichst autark mit Energie versorgt werden soll. Dabei interessiert mich, "
            "ob EquiCube auch bei der Lastverteilung zwischen Wärmepumpe, Ladepunkten und "
            "Speicher unterstützen kann. Über eine kurze Einschätzung würde ich mich "
            "sehr freuen.\n\n"
            "Freundliche Grüße\nJulia Wolf"
        ),
        status="read",
        days_ago=14,
        hours_ago=8,
    ),
    InquiryFixture(
        first_name="Andreas",
        last_name="Klein",
        email="andreas.klein@example.com",
        message=(
            "Guten Tag,\n\n"
            "wir interessieren uns für eine Partnerschaft im Bereich Vertrieb. Unser "
            "Unternehmen ist seit über zwanzig Jahren im Anlagenbau tätig und hat ein "
            "breites Netzwerk zu Industriekunden. Wenn Sie ein Partnermodell anbieten, "
            "würden wir gerne mehr über Margen, Schulungen und technischen Support "
            "erfahren.\n\n"
            "Viele Grüße\nAndreas Klein"
        ),
        status="read",
        days_ago=16,
        hours_ago=2,
    ),
    InquiryFixture(
        first_name="Sabine",
        last_name="Koch",
        email="sabine.koch@example.com",
        message=(
            "Sehr geehrte Damen und Herren,\n\n"
            "bei uns in der Verwaltung läuft derzeit ein Pilotprojekt zur Erfassung von "
            "Gebäudeverbräuchen. Wir würden gerne prüfen, ob EquiCube die Daten mehrerer "
            "Liegenschaften zusammenführen und daraus automatische Hinweise auf "
            "Einsparpotenziale ableiten kann. Welche Formate können importiert werden?\n\n"
            "Mit freundlichen Grüßen\nSabine Koch"
        ),
        status="read",
        days_ago=18,
        hours_ago=5,
    ),
    InquiryFixture(
        first_name="Florian",
        last_name="Schulz",
        email="florian.schulz@example.com",
        message=(
            "Hallo zusammen,\n\n"
            "ich habe Ihre Ankündigung zur fairen Verteilung von KI-Rechenzeit gelesen "
            "und finde den Ansatz sehr spannend. Als Betreiber eines kleinen "
            "Rechenclusters frage ich mich, wie Konflikte gelöst werden, wenn mehrere "
            "Nutzer gleichzeitig hohe Priorität anfordern. Gibt es dazu ein nachlesbares "
            "Verfahren?\n\n"
            "Beste Grüße\nFlorian Schulz"
        ),
        status="done",
        days_ago=20,
        hours_ago=10,
    ),
    InquiryFixture(
        first_name="Petra",
        last_name="Becker",
        email="petra.becker@example.com",
        message=(
            "Guten Tag,\n\n"
            "vielen Dank für das informative Gespräch auf der Messe. Wie besprochen "
            "sende ich Ihnen hier die Eckdaten unseres Projekts: rund 40 Standorte, "
            "heterogene Zählerinfrastruktur und ein festes Budget für das kommende "
            "Geschäftsjahr. Bitte lassen Sie uns wissen, wie ein gemeinsamer "
            "Projektplan aussehen könnte.\n\n"
            "Freundliche Grüße\nPetra Becker"
        ),
        status="done",
        days_ago=22,
        hours_ago=4,
    ),
    InquiryFixture(
        first_name="Lukas",
        last_name="Hofmann",
        email="lukas.hofmann@example.com",
        message=(
            "Hallo EquiCrew,\n\n"
            "wir haben EquiCube nun einige Wochen im Testbetrieb und sind mit der "
            "Stabilität sehr zufrieden. Eine Rückfrage ist noch offen: Lassen sich "
            "eigene Regeln für Warnmeldungen hinterlegen, etwa wenn ein Verbrauchswert "
            "über mehrere Stunden ungewöhnlich hoch bleibt? Vielen Dank für Ihre "
            "Unterstützung.\n\n"
            "Freundliche Grüße\nLukas Hofmann"
        ),
        status="done",
        days_ago=24,
        hours_ago=7,
    ),
    InquiryFixture(
        first_name="Nina",
        last_name="Wagner",
        email="nina.wagner@example.com",
        message=(
            "Sehr geehrte Damen und Herren,\n\n"
            "ich schreibe im Auftrag unserer Geschäftsführung. Wir möchten unsere "
            "Nachhaltigkeitsbilanz verbessern und suchen nach einer Lösung, mit der sich "
            "der Energieverbrauch unserer Bürogebäude transparent darstellen lässt. "
            "Bitte senden Sie uns Unterlagen zu den Funktionen und eine Übersicht über "
            "vergleichbare Projekte.\n\n"
            "Mit freundlichen Grüßen\nNina Wagner"
        ),
        status="done",
        days_ago=26,
        hours_ago=1,
    ),
    InquiryFixture(
        first_name="Markus",
        last_name="Simon",
        email="markus.simon@example.com",
        message=(
            "Hallo,\n\n"
            "wir sind ein junges Start-up im Bereich Ladeinfrastruktur und suchen eine "
            "Möglichkeit, das Ladeverhalten unserer Kunden zu analysieren, ohne die "
            "Daten an Dritte weiterzugeben. EquiCube könnte dafür interessant sein. "
            "Welche Rolle spielt die lokale Verarbeitung, und wie werden Updates "
            "eingespielt?\n\n"
            "Viele Grüße\nMarkus Simon"
        ),
        status="done",
        days_ago=28,
        hours_ago=9,
    ),
    InquiryFixture(
        first_name="Katharina",
        last_name="Brandt",
        email="katharina.brandt@example.com",
        message=(
            "Guten Tag,\n\n"
            "ich bin Lehrerin an einer berufsbildenden Schule und würde das Thema "
            "energieeffiziente KI gerne in den Unterricht bringen. Gibt es "
            "Unterrichtsmaterialien oder die Möglichkeit, mit Ihrer Lösung eine kleine "
            "Demonstration im Klassenzimmer durchzuführen? Über Hinweise wäre ich sehr "
            "dankbar.\n\n"
            "Freundliche Grüße\nKatharina Brandt"
        ),
        status="done",
        days_ago=30,
        hours_ago=3,
    ),
    InquiryFixture(
        first_name="Ralf",
        last_name="Günther",
        email="ralf.guenther@example.com",
        message=(
            "Sehr geehrtes Team,\n\n"
            "wir betreiben eine mittelgroße Bäckerei mit mehreren Filialen und möchten "
            "den Stromverbrauch unserer Kühlanlagen besser verstehen. Die Geräte sind "
            "teils älter und liefern keine einheitlichen Daten. Können Sie einschätzen, "
            "mit welchem Aufwand eine Anbindung trotzdem möglich wäre?\n\n"
            "Freundliche Grüße\nRalf Günther"
        ),
        status="done",
        days_ago=33,
        hours_ago=6,
    ),
    InquiryFixture(
        first_name="Elisabeth",
        last_name="Fröhlich",
        email="elisabeth.froehlich@example.com",
        message=(
            "Hallo EquiCrew,\n\n"
            "ich bin Journalistin und schreibe einen Beitrag über lokale KI-Anwendungen "
            "im Energiesektor. Ihr Ansatz, Rechenleistung fair zu verteilen, würde gut "
            "in den Artikel passen. Hätten Sie in den nächsten Tagen Zeit für ein "
            "kurzes Interview? Gerne sende ich Ihnen die Fragen vorab.\n\n"
            "Mit freundlichen Grüßen\nElisabeth Fröhlich"
        ),
        status="done",
        days_ago=35,
        hours_ago=8,
    ),
    InquiryFixture(
        first_name="Oliver",
        last_name="Jäger",
        email="oliver.jaeger@example.com",
        message=(
            "Guten Tag,\n\n"
            "wir möchten unsere bestehende Gebäudeleittechnik um Funktionen zur "
            "vorausschauenden Wartung ergänzen. Dabei sollen Auffälligkeiten in den "
            "Verbrauchsdaten frühzeitig erkannt werden. Ist EquiCube hierfür "
            "grundsätzlich geeignet, und welche Anbindung an gängige Protokolle wird "
            "unterstützt?\n\n"
            "Beste Grüße\nOliver Jäger"
        ),
        status="done",
        days_ago=38,
        hours_ago=2,
    ),
    InquiryFixture(
        first_name="Miriam",
        last_name="Stein",
        email="miriam.stein@example.com",
        message=(
            "Sehr geehrte Damen und Herren,\n\n"
            "unser Unternehmen ist auf Beratung für kommunale Energieprojekte "
            "spezialisiert. Für eine Machbarkeitsstudie benötigen wir eine grobe "
            "Kalkulation, was der Betrieb von EquiCube über fünf Jahre kosten würde. "
            "Können Sie uns dafür eine erste Orientierung geben?\n\n"
            "Mit freundlichen Grüßen\nMiriam Stein"
        ),
        status="done",
        days_ago=41,
        hours_ago=5,
    ),
    InquiryFixture(
        first_name="Holger",
        last_name="Albrecht",
        email="holger.albrecht@example.com",
        message=(
            "Hallo zusammen,\n\n"
            "vielen Dank für die schnelle Rückmeldung bei meiner letzten Anfrage. Die "
            "Testumgebung läuft inzwischen stabil, und wir konnten erste Auswertungen "
            "erstellen. Mir ist noch unklar, wie wir die Ergebnisse automatisch an unser "
            "Reporting-System übergeben können. Gibt es dafür eine API oder einen "
            "Export?\n\n"
            "Freundliche Grüße\nHolger Albrecht"
        ),
        status="done",
        days_ago=45,
        hours_ago=7,
    ),
    InquiryFixture(
        first_name="Claudia",
        last_name="Peters",
        email="claudia.peters@example.com",
        message=(
            "Guten Tag,\n\n"
            "ich interessiere mich für eine Schulung oder Einführung in EquiCube für "
            "unser Team. Wir sind sechs Personen aus den Bereichen Facility Management "
            "und IT und würden sowohl eine Online-Schulung als auch einen Workshop vor "
            "Ort in Betracht ziehen. Welche Formate bieten Sie an?\n\n"
            "Freundliche Grüße\nClaudia Peters"
        ),
        status="new",
        days_ago=49,
        hours_ago=4,
    ),
)


@dataclass(frozen=True)
class SeedResult:
    """What a seed run changed: the demo account and the new inquiries."""

    account_created: bool
    inquiries_created: int


def seed_database(db: DatabaseSession, now: datetime | None = None) -> SeedResult:
    """Insert the demo account and any missing demo inquiries, in one transaction."""
    base_time = now or datetime.now(UTC)

    demo_user = db.scalar(select(User).where(func.lower(User.email) == normalize_email(DEMO_EMAIL)))
    account_created = demo_user is None
    if account_created:
        db.add(User(email=normalize_email(DEMO_EMAIL), password_hash=hash_password(DEMO_PASSWORD)))

    existing = {
        (email.lower(), message)
        for email, message in db.execute(select(Inquiry.email, Inquiry.message)).all()
    }

    inquiries_created = 0
    for fixture in DEMO_INQUIRIES:
        key = (fixture.email.lower(), fixture.message)
        if key in existing:
            continue
        db.add(
            Inquiry(
                first_name=fixture.first_name,
                last_name=fixture.last_name,
                email=fixture.email,
                message=fixture.message,
                status=fixture.status,
                created_at=base_time - timedelta(days=fixture.days_ago, hours=fixture.hours_ago),
            )
        )
        existing.add(key)
        inquiries_created += 1

    db.commit()
    return SeedResult(account_created=account_created, inquiries_created=inquiries_created)


def build_parser() -> argparse.ArgumentParser:
    """Build the command line parser for the seed command."""
    return argparse.ArgumentParser(
        prog="python -m app.seed",
        description="Fill an empty database with the demo account and demo inquiries.",
    )


def main(argv: Sequence[str] | None = None) -> int:
    """Run the seed command and return its process exit code."""
    build_parser().parse_args(argv)
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        try:
            result = seed_database(db)
        except Exception as exc:
            db.rollback()
            print(f"error: could not seed the database: {exc}", file=sys.stderr)
            return 1

    if result.account_created:
        print(f"Created demo account {DEMO_EMAIL}.")
    else:
        print(f"Demo account {DEMO_EMAIL} already exists; left unchanged.")
    print(f"Added {result.inquiries_created} demo inquiries.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
