import { usePageMeta } from "../lib/meta";

export default function LoginPage() {
  usePageMeta(
    "Anmeldung – EquiCrew Intern",
    "Anmeldung für den internen Bereich von EquiCrew.",
  );

  return (
    <section className="page" aria-labelledby="login-title">
      <p className="page__eyebrow">Intern</p>
      <h1 id="login-title">Anmeldung</h1>
      <p className="page__lead">
        Der interne Bereich ist nur für das EquiCrew-Team zugänglich.
      </p>
    </section>
  );
}
