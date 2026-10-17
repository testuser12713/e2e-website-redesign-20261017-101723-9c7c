import { usePageMeta } from "../lib/meta";

export default function About() {
  usePageMeta(
    "Über uns – EquiCrew",
    "Das Team hinter EquiCrew und EquiCube: Michael Hochstöger, Christian Hinterdorfer und Christian Hinterreiter.",
  );

  return (
    <section className="page" aria-labelledby="about-title">
      <p className="page__eyebrow">Team</p>
      <h1 id="about-title">Über uns</h1>
      <p className="page__lead">
        EquiCrew steht für smarte Energie und faire verteilte KI – entwickelt in
        Mauthausen.
      </p>
    </section>
  );
}
