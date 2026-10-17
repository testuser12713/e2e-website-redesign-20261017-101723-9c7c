import { usePageMeta } from "../lib/meta";

export default function Legal() {
  usePageMeta(
    "Impressum – EquiCrew",
    "Impressum von EquiCrew FlexCo, Marktplatz 14, 4310 Mauthausen, FN 648043 f.",
  );

  return (
    <section className="page" aria-labelledby="legal-title">
      <p className="page__eyebrow">Rechtliches</p>
      <h1 id="legal-title">Impressum</h1>
      <p className="page__lead">
        EquiCrew FlexCo, Marktplatz 14, 4310 Mauthausen, FN 648043 f.
      </p>
    </section>
  );
}
