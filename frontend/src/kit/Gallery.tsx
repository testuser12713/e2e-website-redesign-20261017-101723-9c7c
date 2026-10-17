import Alert from "../components/Alert";
import ArrowLink from "../components/ArrowLink";
import Avatar from "../components/Avatar";
import Brand from "../components/Brand";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import FormField from "../components/FormField";
import Kicker from "../components/Kicker";
import Section from "../components/Section";
import SocialLinks from "../components/SocialLinks";
import StatusBadge from "../components/StatusBadge";
import TextArea from "../components/TextArea";
import TextInput from "../components/TextInput";
import SiteFooter from "../components/chrome/SiteFooter";
import SiteHeader from "../components/chrome/SiteHeader";
import { usePageMeta } from "../lib/meta";
import "./Gallery.css";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
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

export default function Gallery() {
  usePageMeta(
    "UI-Kit – EquiCrew",
    "Interne Übersicht der EquiCrew-Komponenten und Design-Tokens.",
  );

  return (
    <div className="kit">
      <div className="kit__intro">
        <Kicker>Entwicklung</Kicker>
        <h1 id="gallery-title">UI-Kit</h1>
        <p className="kit__lead">
          Alle Komponenten des EquiCrew-Auftritts in jeder vorgesehenen
          Ausprägung. Die Galerie ist nur in der Entwicklungsumgebung
          erreichbar.
        </p>
      </div>

      <section className="kit__section" aria-labelledby="kit-buttons">
        <h2 id="kit-buttons">Buttons</h2>
        <p className="kit__note">
          Primär, Sekundär, Ghost und auf dunklem Grund, mit den Zuständen
          Ruhe, Hover, Fokus, Aktiv, Deaktiviert und Laden.
        </p>

        <div className="kit__row">
          <div data-testid="button-primary">
            <Button icon={<ArrowIcon />}>Primär</Button>
          </div>
          <div data-testid="button-secondary">
            <Button variant="secondary">Sekundär</Button>
          </div>
          <div data-testid="button-ghost">
            <Button variant="ghost">Ghost</Button>
          </div>
          <div data-testid="button-on-dark">
            <Button variant="on-dark">Auf Dunkel</Button>
          </div>
        </div>

        <div className="kit__dark">
          <div className="kit__row">
            <Button variant="on-dark">Auf dunklem Grund</Button>
            <Button variant="primary">Primär</Button>
          </div>
        </div>

        <div className="kit__row">
          <div data-testid="button-sm">
            <Button size="sm">Klein</Button>
          </div>
          <div data-testid="button-block">
            <Button block>Volle Breite</Button>
          </div>
          <div data-testid="button-disabled">
            <Button disabled>Deaktiviert</Button>
          </div>
          <div data-testid="button-loading">
            <Button loading loadingLabel="Wird gesendet …">
              Nachricht senden
            </Button>
          </div>
        </div>

        <div className="kit__row">
          <div data-testid="button-icon">
            <Button icon={<ArrowIcon />}>Mit Icon</Button>
          </div>
          <div data-testid="button-link">
            <Button to="/kontakt" variant="secondary">
              Als Link
            </Button>
          </div>
        </div>
      </section>

      <section className="kit__section" aria-labelledby="kit-fields">
        <h2 id="kit-fields">Formularfelder</h2>
        <p className="kit__note">
          Eingabefeld, Textbereich und Feldgruppe mit Label, Pflichtmarkierung,
          Hinweis und Fehlermeldung.
        </p>

        <div className="kit__form">
          <div data-testid="field-default">
            <FormField
              label="Vorname"
              required
              hint="So sprechen wir dich in unserer Antwort an."
            >
              <TextInput
                name="kit-first-name"
                autoComplete="given-name"
                placeholder="z. B. Anna"
              />
            </FormField>
          </div>

          <div data-testid="field-error">
            <FormField
              label="E-Mail-Adresse"
              required
              error="Bitte gib eine gültige E-Mail-Adresse ein."
            >
              <TextInput
                name="kit-email"
                type="email"
                autoComplete="email"
                placeholder="anna.gruber@beispiel.at"
                invalid
              />
            </FormField>
          </div>

          <div data-testid="field-full">
            <FormField label="Nachricht" required fullWidth>
              <TextArea
                name="kit-message"
                placeholder="Erzähl uns kurz von deinem Haus …"
              />
            </FormField>
          </div>
        </div>

        <div className="kit__form">
          <div data-testid="input-default">
            <FormField label="Eingabe">
              <TextInput name="kit-input" placeholder="z. B. Anna" />
            </FormField>
          </div>
          <div data-testid="input-error">
            <FormField label="Eingabe mit Fehler" error="Dieses Feld ist ein Pflichtfeld.">
              <TextInput name="kit-input-error" invalid />
            </FormField>
          </div>
          <div data-testid="input-disabled">
            <FormField label="Deaktivierte Eingabe">
              <TextInput name="kit-input-disabled" disabled value="Nicht verfügbar" readOnly />
            </FormField>
          </div>
          <div data-testid="textarea-default">
            <FormField label="Textbereich">
              <TextArea name="kit-textarea" placeholder="Deine Nachricht …" />
            </FormField>
          </div>
          <div data-testid="textarea-error">
            <FormField label="Textbereich mit Fehler" error="Bitte schreib uns eine Nachricht.">
              <TextArea name="kit-textarea-error" invalid />
            </FormField>
          </div>
          <div data-testid="textarea-disabled">
            <FormField label="Deaktivierter Textbereich">
              <TextArea name="kit-textarea-disabled" disabled value="Nicht verfügbar" readOnly />
            </FormField>
          </div>
        </div>
      </section>

      <section className="kit__section" aria-labelledby="kit-badges">
        <h2 id="kit-badges">Status</h2>
        <p className="kit__note">
          Die drei Status einer Anfrage mit ihrer deutschen Beschriftung.
        </p>
        <div className="kit__row">
          <div data-testid="badge-new">
            <StatusBadge status="new" />
          </div>
          <div data-testid="badge-read">
            <StatusBadge status="read" />
          </div>
          <div data-testid="badge-done">
            <StatusBadge status="done" />
          </div>
        </div>
      </section>

      <section className="kit__section" aria-labelledby="kit-cards">
        <h2 id="kit-cards">Karten</h2>
        <p className="kit__note">
          Fläche, Formular, Merkmal, Founder, Nachricht, Seitenleiste, Panel
          und Impressum.
        </p>

        <div className="kit__grid">
          <div data-testid="card-default">
            <Card>
              <h3>Standardkarte</h3>
              <p>Eine ruhige Fläche für zusammengehörige Inhalte.</p>
            </Card>
          </div>

          <div data-testid="card-feature">
            <Card variant="feature">
              <span className="kit__feature-num">01</span>
              <h3>Merkmal</h3>
              <p>Eine der vier Eigenschaften des EquiCube.</p>
            </Card>
          </div>

          <div data-testid="card-founder">
            <Card as="article" variant="founder">
              <div className="kit__founder-photo" aria-hidden="true">
                MH
              </div>
              <div className="kit__founder-info">
                <h3>Michael Hochstöger</h3>
                <p className="kit__role">Founder</p>
                <a href="mailto:michael.hochstoeger@equicrew.com">
                  michael.hochstoeger@equicrew.com
                </a>
              </div>
            </Card>
          </div>

          <div data-testid="card-message">
            <Card as="article" variant="message">
              <p className="kit__meta">Nachricht über das Kontaktformular</p>
              <p>
                Guten Tag, wir sanieren unser Einfamilienhaus und möchten die
                bestehende Heizung ersetzen.
              </p>
              <div className="kit__sender">
                <Avatar initials="AG" size="sm" />
                <div>
                  <p className="kit__sender-name">Anna Gruber</p>
                  <a href="mailto:anna.gruber@beispiel.at">
                    anna.gruber@beispiel.at
                  </a>
                </div>
              </div>
            </Card>
          </div>

          <div data-testid="card-side">
            <Card as="section" variant="side">
              <h3 className="kit__side-title">Status</h3>
              <div className="kit__row">
                <StatusBadge status="new" />
              </div>
            </Card>
          </div>

          <div data-testid="card-panel">
            <Card variant="panel">
              <div className="kit__panel-head">
                <h3>Alle Anfragen</h3>
                <span>Neueste zuerst</span>
              </div>
              <p className="kit__panel-body">
                Der Rahmen für den Posteingang im internen Bereich.
              </p>
            </Card>
          </div>

          <div data-testid="card-legal">
            <Card variant="legal">
              <h3>Impressum</h3>
              <p>Angaben gemäß § 5 E-Commerce-Gesetz (ECG).</p>
            </Card>
          </div>

          <div data-testid="card-form">
            <Card variant="form">
              <h3>Deine Nachricht an EquiCrew</h3>
              <p>Alle Felder sind erforderlich.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="kit__section" aria-labelledby="kit-sections">
        <h2 id="kit-sections">Abschnitte</h2>
        <p className="kit__note">
          Standard- und kompakter Abschnitt, jeweils mit und ohne getönten
          Hintergrund.
        </p>
        <div data-testid="section-default">
          <Section container="none" className="kit__section-sample">
            <h3>Standardabschnitt</h3>
          </Section>
        </div>
        <div data-testid="section-sm">
          <Section container="none" size="sm" className="kit__section-sample">
            <h3>Kompakter Abschnitt</h3>
          </Section>
        </div>
        <div data-testid="section-tint">
          <Section container="none" tint className="kit__section-sample">
            <h3>Getönter Abschnitt</h3>
          </Section>
        </div>
      </section>

      <section className="kit__section" aria-labelledby="kit-feedback">
        <h2 id="kit-feedback">Rückmeldungen</h2>
        <p className="kit__note">
          Erfolg, Fehler und der leere Zustand einer Liste.
        </p>

        <div data-testid="alert-success">
          <Alert tone="success" title="Danke für deine Nachricht!">
            <p>
              Deine Anfrage ist bei uns eingegangen und wurde gespeichert. Das
              Formular ist jetzt wieder leer.
            </p>
          </Alert>
        </div>

        <div data-testid="alert-error">
          <Alert tone="error" title="Deine Nachricht konnte nicht gespeichert werden.">
            <p>
              Deine Eingaben bleiben erhalten. Bitte prüfe deine Verbindung und
              versuche es erneut.
            </p>
          </Alert>
        </div>

        <div data-testid="alert-inline">
          <Alert tone="error" variant="inline">
            E-Mail-Adresse oder Passwort ist nicht korrekt. Bitte versuche es
            erneut.
          </Alert>
        </div>

        <div data-testid="empty-state">
          <EmptyState
            title="Noch keine Anfragen"
            description="Sobald jemand das Kontaktformular auf der Website ausfüllt, erscheint die Anfrage hier."
          />
        </div>
      </section>

      <section className="kit__section" aria-labelledby="kit-people">
        <h2 id="kit-people">Personen und Marke</h2>
        <p className="kit__note">
          Avatare in drei Größen, die Marke in hell und dunkel, Kicker und
          Social Links.
        </p>

        <div className="kit__row">
          <div data-testid="avatar-sm">
            <Avatar initials="MH" size="sm" />
          </div>
          <div data-testid="avatar-md">
            <Avatar initials="CH" />
          </div>
          <div data-testid="avatar-lg">
            <Avatar initials="CH" size="lg" />
          </div>
          <div data-testid="avatar-dark">
            <Avatar initials="EC" tone="dark" label="EquiCrew Team" />
          </div>
        </div>

        <div className="kit__row">
          <div data-testid="brand-light">
            <Brand />
          </div>
        </div>

        <div className="kit__dark">
          <div className="kit__row">
            <div data-testid="brand-dark">
              <Brand tone="dark" />
            </div>
            <div data-testid="kicker-light">
              <Kicker tone="light">Die Crew</Kicker>
            </div>
          </div>
        </div>

        <div data-testid="kicker-default">
          <Kicker>Das Produkt</Kicker>
        </div>

        <div className="kit__dark" data-testid="social-links">
          <SocialLinks />
        </div>

        <div className="kit__row">
          <div data-testid="arrow-link">
            <ArrowLink to="/equicube">EquiCube im Detail</ArrowLink>
          </div>
          <div data-testid="text-link">
            <ArrowLink to="/kontakt" variant="text">
              Jetzt anfragen
            </ArrowLink>
          </div>
        </div>
      </section>

      <section className="kit__section" aria-labelledby="kit-chrome">
        <h2 id="kit-chrome">Seitenrahmen</h2>
        <p className="kit__note">
          Header mit Hauptnavigation und Footer mit Kontaktdaten und
          Social Links, wie sie auf jeder öffentlichen Seite erscheinen.
        </p>

        <div className="kit__chrome" data-testid="site-header-example">
          <SiteHeader
            navId="gallery-site-nav"
            navToggleTestId="gallery-nav-toggle"
          />
        </div>

        <div className="kit__chrome" data-testid="site-footer-example">
          <SiteFooter />
        </div>
      </section>
    </div>
  );
}
