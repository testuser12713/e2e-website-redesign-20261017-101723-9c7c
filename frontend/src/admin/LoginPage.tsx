import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import Brand from "../components/Brand";
import Button from "../components/Button";
import FormField from "../components/FormField";
import Kicker from "../components/Kicker";
import TextInput from "../components/TextInput";
import { useAuth } from "../auth/AuthContext";
import { usePageMeta } from "../lib/meta";
import "./LoginPage.css";

interface LoginLocationState {
  from?: string;
}

const GENERIC_LOGIN_ERROR =
  "E-Mail-Adresse oder Passwort ist nicht korrekt. Bitte versuche es erneut.";

function resolveTarget(state: unknown): string {
  const from = (state as LoginLocationState | null)?.from;
  if (
    typeof from === "string" &&
    from.startsWith("/intern") &&
    from !== "/intern/login"
  ) {
    return from;
  }
  return "/intern";
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 10h12M11 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M16 10H4M9 5l-5 5 5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  usePageMeta(
    "Interner Bereich – Anmeldung",
    "Anmeldung für den internen Bereich von EquiCrew: Anfragen lesen und Status setzen.",
  );

  const { status, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const target = resolveTarget(location.state);

  if (status === "authenticated") {
    return <Navigate to={target} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextEmailError = email.trim()
      ? ""
      : "Bitte gib deine E-Mail-Adresse ein.";
    const nextPasswordError = password
      ? ""
      : "Bitte gib dein Passwort ein.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError("");

    if (nextEmailError || nextPasswordError) {
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(target, { replace: true });
    } catch {
      setFormError(GENERIC_LOGIN_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-brand" aria-labelledby="login-brand-heading">
          <Brand tone="dark" />
          <h2 id="login-brand-heading" className="login-statement">
            Deine Anfragen.
            <br />
            Deine <em>Crew.</em>
          </h2>
          <div className="login-brand-foot">
            <span>Interner Bereich</span>
            <span aria-hidden="true">·</span>
            <Link to="/">Zur Website</Link>
          </div>
        </section>

        <section className="login-panel" aria-labelledby="login-heading">
          <div className="login-card">
            <Kicker>Anmeldung</Kicker>
            <h1 id="login-heading">Willkommen zurück.</h1>
            <p className="lede">
              Melde dich an, um die Anfragen aus dem Kontaktformular zu lesen und
              ihren Status zu setzen.
            </p>

            <form className="login-form" noValidate onSubmit={handleSubmit}>
              {formError ? (
                <Alert tone="error" variant="inline">
                  {formError}
                </Alert>
              ) : null}

              <FormField label="E-Mail-Adresse" error={emailError} required>
                <TextInput
                  type="email"
                  id="login-email"
                  name="email"
                  autoComplete="username"
                  inputMode="email"
                  placeholder="du@equicrew.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </FormField>

              <FormField label="Passwort" error={passwordError} required>
                <TextInput
                  type="password"
                  id="login-password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Dein Passwort"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </FormField>

              <Button
                type="submit"
                icon={<ArrowIcon />}
                loading={submitting}
                loadingLabel="Anmeldung läuft …"
              >
                Anmelden
              </Button>
            </form>

            <details className="login-demo">
              <summary>Zugangsdaten für den Prototyp</summary>
              <p>
                E-Mail: <code>demo@equicrew.com</code>
                <br />
                Passwort: <code>EquiCrew-Demo-2026</code>
              </p>
              <p>Die Demo-Anmeldung nutzt das vorbereitete Demo-Konto.</p>
            </details>

            <Link className="login-back" to="/">
              <BackIcon />
              Zurück zur Website
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
