import { usePageMeta } from "../lib/meta";

export default function Gallery() {
  usePageMeta(
    "UI-Kit – EquiCrew",
    "Interne Übersicht der EquiCrew-Komponenten und Design-Tokens.",
  );

  return (
    <section className="page" aria-labelledby="gallery-title">
      <p className="page__eyebrow">Entwicklung</p>
      <h1 id="gallery-title">UI-Kit</h1>
      <p className="page__lead">
        Übersicht der Komponenten und Design-Tokens.
      </p>
    </section>
  );
}
