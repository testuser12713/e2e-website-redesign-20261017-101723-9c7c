import { usePageMeta } from "../lib/meta";

export default function Contact() {
  usePageMeta(
    "Kontakt – EquiCrew",
    "Nimm Kontakt mit EquiCrew auf: Marktplatz 14, 4310 Mauthausen, office@equicrew.com.",
  );

  return (
    <section className="page" aria-labelledby="contact-title">
      <p className="page__eyebrow">Kontakt</p>
      <h1 id="contact-title">Kontakt</h1>
      <p className="page__lead">
        Du hast eine Frage oder ein Anliegen? Schreib uns – wir melden uns bei
        dir.
      </p>
    </section>
  );
}
