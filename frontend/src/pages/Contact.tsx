import { useState } from "react";
import type { FormEvent } from "react";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Card from "../components/Card";
import FormField from "../components/FormField";
import Kicker from "../components/Kicker";
import Section from "../components/Section";
import SocialLinks from "../components/SocialLinks";
import TextArea from "../components/TextArea";
import TextInput from "../components/TextInput";
import { ApiError, request } from "../lib/api";
import { usePageMeta } from "../lib/meta";
import "./Contact.css";

type FieldName = "first_name" | "last_name" | "email" | "message";
type FormValues = Record<FieldName, string>;
type FieldErrors = Partial<Record<FieldName, string>>;
type FieldFlags = Partial<Record<FieldName, boolean>>;

const FIELDS: FieldName[] = ["first_name", "last_name", "email", "message"];

const EMPTY_VALUES: FormValues = {
  first_name: "",
  last_name: "",
  email: "",
  message: "",
};

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function validateField(name: FieldName, value: string): string | undefined {
  const trimmed = value.trim();

  if (name === "email") {
    if (!trimmed) {
      return "Bitte gib deine E-Mail-Adresse ein.";
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      return "Bitte gib eine gültige E-Mail-Adresse ein.";
    }
    return undefined;
  }

  if (!trimmed) {
    switch (name) {
      case "first_name":
        return "Bitte gib deinen Vornamen ein.";
      case "last_name":
        return "Bitte gib deinen Nachnamen ein.";
      case "message":
        return "Bitte gib eine Nachricht ein.";
    }
  }

  return undefined;
}

function validateValues(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of FIELDS) {
    const error = validateField(field, values[field]);
    if (error) {
      errors[field] = error;
    }
  }
  return errors;
}

function mapApiFieldErrors(detail: unknown): FieldErrors | null {
  if (!Array.isArray(detail)) {
    return null;
  }

  const mapped: FieldErrors = {};
  for (const entry of detail) {
    if (
      entry !== null &&
      typeof entry === "object" &&
      "field" in entry &&
      "message" in entry
    ) {
      const field = (entry as { field: unknown }).field;
      const message = (entry as { message: unknown }).message;
      if (
        typeof field === "string" &&
        typeof message === "string" &&
        FIELDS.includes(field as FieldName)
      ) {
        mapped[field as FieldName] = message;
      }
    }
  }

  return Object.keys(mapped).length > 0 ? mapped : null;
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

export default function Contact() {
  usePageMeta(
    "Kontakt – frag EquiCrew",
    "Schreib EquiCrew: Vorname, Nachname, E-Mail und Nachricht genügen. Du findest uns am Marktplatz 14 in Mauthausen, per Telefon und E-Mail.",
  );

  const [values, setValues] = useState<FormValues>({ ...EMPTY_VALUES });
  const [touched, setTouched] = useState<FieldFlags>({});
  const [dirty, setDirty] = useState<FieldFlags>({});
  const [submitted, setSubmitted] = useState(false);
  const [apiErrors, setApiErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorTitle, setErrorTitle] = useState(
    "Deine Nachricht konnte nicht gespeichert werden.",
  );
  const [errorText, setErrorText] = useState(
    "Deine Eingaben bleiben erhalten. Bitte prüfe deine Verbindung und versuche es erneut.",
  );

  const clientErrors = validateValues(values);

  function errorFor(field: FieldName): string | undefined {
    if (apiErrors[field]) {
      return apiErrors[field];
    }
    if (submitted || touched[field]) {
      return clientErrors[field];
    }
    return undefined;
  }

  function handleChange(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setStatus((current) => (current === "submitting" ? current : "idle"));
    setDirty((current) => ({ ...current, [field]: true }));
    setApiErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleBlur(field: FieldName) {
    if (dirty[field]) {
      setTouched((current) => ({ ...current, [field]: true }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitted(true);
    setTouched({
      first_name: true,
      last_name: true,
      email: true,
      message: true,
    });
    setApiErrors({});

    if (Object.keys(clientErrors).length > 0) {
      setStatus("idle");
      return;
    }

    setStatus("submitting");

    try {
      await request<{ id: number }>("/api/contact", {
        method: "POST",
        body: JSON.stringify(values),
      });

      setValues({ ...EMPTY_VALUES });
      setTouched({});
      setDirty({});
      setSubmitted(false);
      setStatus("success");
    } catch (error) {
      const fieldErrors =
        error instanceof ApiError && error.status === 422
          ? mapApiFieldErrors(error.detail)
          : null;

      if (fieldErrors) {
        setApiErrors(fieldErrors);
        setErrorTitle("Bitte prüfe deine Eingaben.");
        setErrorText(
          "Einige Angaben sind noch nicht korrekt. Bitte korrigiere die markierten Felder und versuche es erneut.",
        );
      } else {
        const detail =
          error instanceof ApiError && typeof error.detail === "string"
            ? error.detail
            : null;
        setErrorTitle("Deine Nachricht konnte nicht gespeichert werden.");
        setErrorText(
          detail ??
            "Deine Eingaben bleiben erhalten. Bitte prüfe deine Verbindung und versuche es erneut.",
        );
      }

      setStatus("error");
    }
  }

  return (
    <>
      <section className="contact-hero" aria-labelledby="contact-title">
        <Kicker>Kontakt</Kicker>
        <h1 id="contact-title" className="contact-hero__title">
          Erzähl uns von deinem Vorhaben.
        </h1>
        <p className="contact-hero__lede">
          Ein paar Zeilen genügen. Schreib uns, was du planst, und wir melden uns
          persönlich bei dir.
        </p>
      </section>

      <Section
        container="none"
        size="sm"
        className="contact-section"
        aria-labelledby="contact-form-heading"
      >
        <div className="contact-layout">
          <Card variant="form" className="contact-form-card">
            <div className="contact-form__head">
              <h2 id="contact-form-heading">Deine Nachricht an EquiCrew</h2>
              <p>Alle Felder sind erforderlich.</p>
            </div>

            {status === "success" ? (
              <Alert tone="success" title="Danke für deine Nachricht!">
                <p>
                  Deine Anfrage ist bei uns eingegangen und wurde gespeichert.
                  Das Formular ist jetzt wieder leer.
                </p>
              </Alert>
            ) : null}

            {status === "error" ? (
              <Alert tone="error" title={errorTitle}>
                <p>{errorText}</p>
              </Alert>
            ) : null}

            <form className="contact-form" noValidate onSubmit={handleSubmit}>
              <div className="contact-form__grid">
                <FormField label="Vorname" required error={errorFor("first_name")}>
                  <TextInput
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="z. B. Anna"
                    maxLength={120}
                    value={values.first_name}
                    onChange={(event) =>
                      handleChange("first_name", event.target.value)
                    }
                    onBlur={() => handleBlur("first_name")}
                  />
                </FormField>

                <FormField label="Nachname" required error={errorFor("last_name")}>
                  <TextInput
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="z. B. Gruber"
                    maxLength={120}
                    value={values.last_name}
                    onChange={(event) =>
                      handleChange("last_name", event.target.value)
                    }
                    onBlur={() => handleBlur("last_name")}
                  />
                </FormField>

                <FormField
                  label="E-Mail-Adresse"
                  required
                  fullWidth
                  error={errorFor("email")}
                >
                  <TextInput
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="anna.gruber@beispiel.at"
                    maxLength={320}
                    value={values.email}
                    onChange={(event) =>
                      handleChange("email", event.target.value)
                    }
                    onBlur={() => handleBlur("email")}
                  />
                </FormField>

                <FormField
                  label="Nachricht"
                  required
                  fullWidth
                  error={errorFor("message")}
                >
                  <TextArea
                    id="message"
                    name="message"
                    placeholder="Erzähl uns kurz von deinem Haus, deiner bestehenden Heizung oder deinem geplanten Projekt …"
                    maxLength={5000}
                    value={values.message}
                    onChange={(event) =>
                      handleChange("message", event.target.value)
                    }
                    onBlur={() => handleBlur("message")}
                  />
                </FormField>
              </div>

              <div className="contact-form__footer">
                <p className="contact-form__note">
                  Deine Angaben werden ausschließlich zur Beantwortung deiner
                  Anfrage verwendet.
                </p>
                <Button
                  type="submit"
                  icon={<ArrowIcon />}
                  loading={status === "submitting"}
                  loadingLabel="Wird gesendet …"
                >
                  Nachricht senden
                </Button>
              </div>
            </form>
          </Card>

          <Card
            as="aside"
            variant="side"
            className="contact-panel"
            aria-labelledby="contact-details-heading"
          >
            <Kicker tone="light">Direkt erreichbar</Kicker>
            <h2 id="contact-details-heading">Lieber persönlich?</h2>

            <div className="contact-block">
              <p className="contact-label">Adresse</p>
              <address>
                EquiCrew FlexCo
                <br />
                Marktplatz 14
                <br />
                4310 Mauthausen
                <br />
                Österreich
              </address>
            </div>

            <div className="contact-block">
              <p className="contact-label">Telefon</p>
              <p>
                <a href="tel:+436504593129">+43&nbsp;650&nbsp;4593&nbsp;129</a>
              </p>
            </div>

            <div className="contact-block">
              <p className="contact-label">E-Mail</p>
              <p>
                <a href="mailto:office@equicrew.com">office@equicrew.com</a>
              </p>
            </div>

            <div className="contact-block">
              <p className="contact-label">Folge uns</p>
              <SocialLinks />
            </div>

            <p className="contact-side-note">
              Deine Nachricht geht direkt an unser Team in Mauthausen. Keine
              Weitergabe, kein Tracking.
            </p>
          </Card>
        </div>
      </Section>
    </>
  );
}
