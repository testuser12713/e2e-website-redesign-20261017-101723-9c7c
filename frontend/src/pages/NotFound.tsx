import { Link } from "react-router-dom";
import { usePageMeta } from "../lib/meta";

export default function NotFound() {
  usePageMeta(
    "Seite nicht gefunden – EquiCrew",
    "Die aufgerufene Seite existiert nicht. Zurück zur EquiCrew-Startseite.",
  );

  return (
    <section className="page" aria-labelledby="not-found-title">
      <p className="page__eyebrow">Fehler 404</p>
      <h1 id="not-found-title">Seite nicht gefunden</h1>
      <p className="page__lead">
        Die aufgerufene Seite existiert nicht oder ist nicht mehr verfügbar.
      </p>
      <p>
        <Link to="/">Zur Startseite</Link>
      </p>
    </section>
  );
}
