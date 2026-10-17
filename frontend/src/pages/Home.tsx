import ArrowLink from "../components/ArrowLink";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import Card from "../components/Card";
import Kicker from "../components/Kicker";
import Section from "../components/Section";
import { usePageMeta } from "../lib/meta";
import "./Home.css";

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

const CREW = [
  { initials: "MH", name: "Michael Hochstöger", role: "Founder" },
  { initials: "CH", name: "Christian Hinterdorfer", role: "Founder" },
  { initials: "CH", name: "Christian Hinterreiter", role: "Founder" },
];

const FEATURES = [
  "Standardisierter Basis-Cube",
  "Modular anpassbar",
  "Für Fußboden- und Radiatorenheizung",
  "Heizleistung bis 40 kW",
];

export default function Home() {
  usePageMeta(
    "EquiCrew – smarte Energie, fair verteilte KI · Start",
    "EquiCrew entwickelt den EquiCube: Wärmepumpe, Batterie, PV, Pufferspeicher und KI-Technik in einem System. Energie und KI nachhaltig und fair verteilt.",
  );

  return (
    <>
      <Section
        className="home-hero"
        container="none"
        aria-labelledby="home-title"
        data-od-id="home-hero"
      >
        <div className="home-hero__grid">
          <div>
            <Kicker>Energie · KI · Gebäudetechnik</Kicker>
            <h1 id="home-title" className="home-hero__title">
              equicrew – smarte energie · <em>fair verteilte KI</em>
            </h1>
            <p className="home-hero__copy">
              Energie und KI nachhaltig bereitstellen und nutzen, um den
              nachfolgenden Generationen bestmögliche Chancen zu sichern.
            </p>
            <div className="home-hero__actions">
              <Button to="/equicube" icon={<ArrowIcon />}>
                EquiCube entdecken
              </Button>
              <Button to="/kontakt" variant="secondary">
                Jetzt anfragen
              </Button>
            </div>
            <p className="home-hero__note">
              EquiCrew FlexCo · Mauthausen, Oberösterreich
            </p>
          </div>

          <div
            className="home-stage"
            data-od-id="home-equicube-visual"
          >
            <span className="home-stage__chip">
              <span aria-hidden="true" />
              EquiCube · ein System
            </span>
            <img
              className="home-stage__mark"
              src="/equicrew-mark.svg"
              width={180}
              height={180}
              alt=""
              aria-hidden="true"
            />
            <span className="home-stage__card">
              <strong>bis 40 kW</strong>
              <span>Heizleistung für Einfamilienhäuser</span>
            </span>
          </div>
        </div>
      </Section>

      <Section
        className="home-mission"
        container="none"
        aria-label="Mission"
        data-od-id="home-mission"
      >
        <Card className="home-mission__panel">
          <Kicker tone="light">Unsere Mission</Kicker>
          <p className="home-mission__quote">
            Energie und KI sollen nicht nur funktionieren. Sie sollen{" "}
            <em>fair verteilt</em> sein.
          </p>
          <div className="home-mission__foot">
            <span className="home-mission__line" aria-hidden="true" />
            <p>
              EquiCrew stellt Energie und KI nachhaltig bereit und nutzt beides
              so, dass nachfolgende Generationen die besten Chancen haben.
            </p>
          </div>
        </Card>
      </Section>

      <Section
        className="home-product"
        container="none"
        aria-labelledby="product-heading"
        data-od-id="home-product"
      >
        <div className="home-product__grid">
          <div className="home-product__frame" data-od-id="home-product-image">
            <span className="home-product__frame-label">EquiCube / System</span>
            <img
              className="home-product__mark"
              src="/equicrew-mark.svg"
              width={180}
              height={180}
              alt=""
              aria-hidden="true"
            />
          </div>

          <div>
            <Kicker>Das Produkt</Kicker>
            <h2 id="product-heading">
              Ein Cube. Ein System. Keine Insellösungen.
            </h2>
            <p className="home-product__lede">
              Der EquiCube vereint Luft-Wasser-Wärmepumpe, Batterie, PV-Technik,
              Pufferspeicher sowie KI- und Server-Technik in einem System –
              abgestimmt statt einzeln zusammengebaut.
            </p>
            <div className="home-product__features">
              {FEATURES.map((feature, index) => (
                <Card
                  key={feature}
                  variant="feature"
                  className="home-product__feature"
                >
                  <span className="home-product__feature-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p>{feature}</p>
                </Card>
              ))}
            </div>
            <p className="home-product__link">
              <ArrowLink to="/equicube">EquiCube im Detail</ArrowLink>
            </p>
          </div>
        </div>
      </Section>

      <Section
        className="home-crew"
        container="none"
        aria-labelledby="crew-heading"
        data-od-id="home-crew"
      >
        <div className="home-crew__grid">
          <div className="home-crew__photo">
            <img
              className="home-crew__mark"
              src="/equicrew-mark.svg"
              width={180}
              height={180}
              alt=""
              aria-hidden="true"
            />
            <div className="home-crew__caption">
              <span>Die Crew hinter EquiCrew</span>
              <span>Mauthausen · Österreich</span>
            </div>
          </div>

          <div>
            <Kicker>Die Crew</Kicker>
            <h2 id="crew-heading">Jedes Schiff braucht eine Crew.</h2>
            <p className="home-crew__lede">
              Gemeinsam gehen wir den Weg zu Heizsystemen ohne Kopfzerbrechen –
              und zu grüner, fair verteilter KI-Technologie.
            </p>
            <ul className="home-crew__list">
              {CREW.map((member) => (
                <li key={member.name}>
                  <Avatar initials={member.initials} />
                  <span>
                    <span className="home-crew__name">{member.name}</span>
                    <span className="home-crew__role">{member.role}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="home-crew__link">
              <ArrowLink to="/ueber-uns">Die Crew kennenlernen</ArrowLink>
            </p>
          </div>
        </div>
      </Section>

      <Section
        size="sm"
        className="home-contact"
        container="none"
        aria-label="Kontaktaufruf"
        data-od-id="home-contact-cta"
      >
        <Card className="home-contact__band">
          <div>
            <Kicker>Kontakt</Kicker>
            <h2>Bereit für ein Heizsystem ohne Kopfzerbrechen?</h2>
            <p>
              Erzähl uns von deinem Haus und deinen Plänen. Wir melden uns
              persönlich bei dir.
            </p>
          </div>
          <div className="home-contact__actions">
            <Button to="/kontakt" icon={<ArrowIcon />}>
              Jetzt anfragen
            </Button>
            <Button href="tel:+436504593129" variant="secondary">
              +43&nbsp;650&nbsp;4593&nbsp;129
            </Button>
          </div>
        </Card>
      </Section>
    </>
  );
}
