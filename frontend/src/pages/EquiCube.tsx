import { usePageMeta } from "../lib/meta";

export default function EquiCube() {
  usePageMeta(
    "EquiCube – EquiCrew",
    "EquiCube von EquiCrew verbindet Energie und künstliche Intelligenz in einem kompakten, fairen System.",
  );

  return (
    <section className="page" aria-labelledby="equicube-title">
      <p className="page__eyebrow">Produkt</p>
      <h1 id="equicube-title">EquiCube</h1>
      <p className="page__lead">
        EquiCube bringt Energie und künstliche Intelligenz in einem kompakten
        System zusammen.
      </p>
    </section>
  );
}
