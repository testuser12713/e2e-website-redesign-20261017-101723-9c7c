import { usePageMeta } from "../lib/meta";

export default function InquiryPage() {
  usePageMeta(
    "Anfrage – EquiCrew Intern",
    "Detailansicht einer Anfrage im internen Bereich von EquiCrew.",
  );

  return (
    <section className="page" aria-labelledby="inquiry-title">
      <p className="page__eyebrow">Intern</p>
      <h1 id="inquiry-title">Anfrage</h1>
      <p className="page__lead">
        Hier findest du alle Angaben zur ausgewählten Anfrage.
      </p>
    </section>
  );
}
