import { usePageMeta } from "../lib/meta";

export default function Home() {
  usePageMeta(
    "Start – EquiCrew",
    "EquiCrew – smarte Energie, fair verteilte KI. Lerne das Team und EquiCube aus Mauthausen kennen.",
  );

  return (
    <section className="page page--wide" aria-labelledby="home-title">
      <p className="page__eyebrow">EquiCrew</p>
      <h1 id="home-title">equicrew – smarte energie · fair verteilte KI</h1>
      <p className="page__lead">
        Wir entwickeln EquiCube: eine Lösung, die Energie und künstliche
        Intelligenz fair zusammendenkt.
      </p>
    </section>
  );
}
