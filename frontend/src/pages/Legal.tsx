import Card from "../components/Card";
import Kicker from "../components/Kicker";
import Section from "../components/Section";
import { usePageMeta } from "../lib/meta";
import "./Legal.css";

export default function Legal() {
  usePageMeta(
    "Impressum – EquiCrew FlexCo",
    "Impressum der EquiCrew FlexCo: Anschrift, Firmenbuch, UID, Unternehmensgegenstand und vertretungsbefugte Geschäftsführung.",
  );

  return (
    <>
      <Section
        className="legal-hero"
        container="none"
        aria-labelledby="legal-title"
      >
        <Kicker>Rechtliches</Kicker>
        <h1 id="legal-title" className="legal-hero__title">
          Impressum.
        </h1>
        <p className="legal-hero__lede">
          Angaben gemäß § 5 E-Commerce-Gesetz (ECG).
        </p>
      </Section>

      <Section
        size="sm"
        className="legal-sheet-section"
        container="none"
        aria-labelledby="legal-heading"
      >
        <Card variant="legal" className="legal-sheet">
          <h2 id="legal-heading" className="legal-sheet__heading">
            Unternehmensangaben
          </h2>
          <p className="legal-intro">
            EquiCrew FlexCo entwickelt innovative und nachhaltige Produkte für
            smarte Energie und fair verteilte KI-Technologie.
          </p>

          <dl className="legal-blocks">
            <div className="legal-block">
              <dt>Unternehmen</dt>
              <dd>EquiCrew FlexCo</dd>
            </div>
            <div className="legal-block">
              <dt>Rechtsform</dt>
              <dd>FlexCo (Flexible Kapitalgesellschaft)</dd>
            </div>
            <div className="legal-block">
              <dt>Sitz</dt>
              <dd>Mauthausen, Österreich</dd>
            </div>
            <div className="legal-block">
              <dt>Anschrift</dt>
              <dd>
                Marktplatz 14
                <br />
                4310 Mauthausen
                <br />
                Österreich
              </dd>
            </div>
            <div className="legal-block">
              <dt>Firmenbuchnummer</dt>
              <dd>FN 648043 f</dd>
            </div>
            <div className="legal-block">
              <dt>Firmenbuchgericht</dt>
              <dd>Wien</dd>
            </div>
            <div className="legal-block">
              <dt>UID-Nummer</dt>
              <dd>ATU82132979</dd>
            </div>
            <div className="legal-block">
              <dt>Unternehmensgegenstand</dt>
              <dd>Entwicklung von innovativen und nachhaltigen Produkten.</dd>
            </div>
            <div className="legal-block legal-block--wide">
              <dt>Vertretungsbefugte Geschäftsführung</dt>
              <dd className="legal-people">
                <span>
                  Michael Hochstöger{" "}
                  <a href="mailto:michael.hochstoeger@equicrew.com">
                    michael.hochstoeger@equicrew.com
                  </a>
                </span>
                <span>
                  Christian Hinterdorfer{" "}
                  <a href="mailto:christian.hinterdorfer@equicrew.com">
                    christian.hinterdorfer@equicrew.com
                  </a>
                </span>
                <span>
                  Christian Hinterreiter{" "}
                  <a href="mailto:christian.hinterreiter@equicrew.com">
                    christian.hinterreiter@equicrew.com
                  </a>
                </span>
              </dd>
            </div>
            <div className="legal-block">
              <dt>Telefon</dt>
              <dd>
                <a href="tel:+436504593129">
                  +43&nbsp;650&nbsp;4593&nbsp;129
                </a>
              </dd>
            </div>
            <div className="legal-block">
              <dt>E-Mail</dt>
              <dd>
                <a href="mailto:office@equicrew.com">office@equicrew.com</a>
              </dd>
            </div>
          </dl>

          <p className="legal-note">
            EquiCrew FlexCo ist um eine verantwortungsvolle Nutzung von Energie
            und KI bemüht. Für Anfragen zu deinen Daten oder zu einer Nachricht,
            die du über das Kontaktformular gesendet hast, erreichst du uns
            unter{" "}
            <a href="mailto:office@equicrew.com">office@equicrew.com</a>.
          </p>
        </Card>
      </Section>
    </>
  );
}
