import { usePageMeta } from "../lib/meta";

export default function InboxPage() {
  usePageMeta(
    "Anfragen – EquiCrew Intern",
    "Alle eingegangenen Anfragen im internen Bereich von EquiCrew.",
  );

  return (
    <section className="page" aria-labelledby="inbox-title">
      <p className="page__eyebrow">Intern</p>
      <h1 id="inbox-title">Anfragen</h1>
      <p className="page__lead">
        Hier erscheinen alle eingegangenen Anfragen – neueste zuerst.
      </p>
    </section>
  );
}
