import Button from "../components/Button";
import Card from "../components/Card";
import Kicker from "../components/Kicker";
import Section from "../components/Section";
import { usePageMeta } from "../lib/meta";
import "./EquiCube.css";

const FEATURES = [
  {
    number: "01",
    title: "Standardisierter Basis-Cube",
    text: "Eine gemeinsame, durchdachte Grundlage für jedes EquiCube-System.",
  },
  {
    number: "02",
    title: "Modular anpassbar",
    text: "Die Module werden an Haus, Heizung und tatsächlichen Bedarf angepasst.",
  },
  {
    number: "03",
    title: "Für Fußboden- und Radiatorenheizung",
    text: "Funktioniert mit moderner Fußbodenheizung ebenso wie mit bestehenden Radiatoren.",
  },
  {
    number: "04",
    title: "Heizleistung bis 40 kW",
    text: "Leistungsfähige Wärmeversorgung, integriert in ein kompaktes Gesamtsystem.",
  },
];

const ADVANTAGES = [
  {
    number: "01",
    title: "Installation in über 2 Stunden",
    text: "Der kompakte Aufbau verkürzt die Montage vor Ort deutlich.",
  },
  {
    number: "02",
    title: "Einfache Wartbarkeit",
    text: "Aufbau und Komponenten sind auf einen unkomplizierten Service ausgelegt.",
  },
  {
    number: "03",
    title: "Abgestimmte Komponenten aus einer Hand",
    text: "Wärmepumpe, Batterie, PV, Speicher und KI-Technik sind aufeinander abgestimmt.",
  },
  {
    number: "04",
    title: "Minimierter Platzbedarf",
    text: "Mehrere Funktionen in einem System schaffen Raum im Technikraum.",
  },
];

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

export default function EquiCube() {
  usePageMeta(
    "EquiCube – Wärmepumpe, Batterie, PV und KI in einem System | EquiCrew",
    "Der EquiCube vereint Luft-Wasser-Wärmepumpe, Batterie, PV-Technik, Pufferspeicher und KI-Technik in einem kompakten System für Einfamilienhäuser – EquiCrew.",
  );

  return (
    <div className="equicube">
      <Section
        className="equicube-hero"
        container="none"
        aria-labelledby="equicube-title"
        data-od-id="equicube-hero"
      >
        <div className="equicube-hero__grid">
          <div>
            <Kicker>Das Produkt</Kicker>
            <h1 id="equicube-title" className="equicube-title">
              Wärme, Strom und KI. In einem Cube.
            </h1>
            <p className="equicube-lede">
              Der EquiCube ist die innovative Komplettlösung für
              Einfamilienhäuser: Luft-Wasser-Wärmepumpe, Batterie, PV-Technik,
              Pufferspeicher sowie KI- und Server-Technik greifen in einem
              System ineinander – statt als einzelne Insellösungen.
            </p>
            <div className="equicube-hero__actions">
              <Button to="/kontakt" icon={<ArrowIcon />}>
                Jetzt anfragen!
              </Button>
              <Button to="/ueber-uns" variant="secondary">
                Die Crew kennenlernen
              </Button>
            </div>
            <ul className="equicube-meta">
              <li>Für Einfamilienhäuser</li>
              <li>Bis 40 kW Heizleistung</li>
              <li>Montage in über 2 Stunden</li>
            </ul>
          </div>
          <div
            className="equicube-visual"
            data-od-id="equicube-product-visual"
            aria-hidden="true"
          >
            <span className="equicube-visual__ring" />
          </div>
        </div>
      </Section>

      <Section
        className="equicube-features"
        container="none"
        aria-labelledby="features-heading"
        data-od-id="equicube-features"
      >
        <div className="equicube-head">
          <div>
            <Kicker>Die Merkmale</Kicker>
            <h2 id="features-heading">
              Vier Dinge, die den EquiCube ausmachen.
            </h2>
          </div>
          <p className="equicube-lede">
            Standardisiert im Kern, flexibel im Detail. Damit das System zu
            deinem Haus passt – und nicht umgekehrt.
          </p>
        </div>
        <div className="equicube-features__grid">
          {FEATURES.map((feature) => (
            <Card
              key={feature.number}
              as="article"
              variant="feature"
              className="equicube-feature"
            >
              <span className="equicube-num">{feature.number}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="equicube-advantages"
        container="none"
        aria-labelledby="advantages-heading"
        data-od-id="equicube-advantages"
      >
        <div className="equicube-advantages__grid">
          <div>
            <Kicker>Die Vorteile</Kicker>
            <h2 id="advantages-heading">Weniger Aufwand. Mehr Überblick.</h2>
            <p className="equicube-lede">
              Ein System statt vieler Einzelentscheidungen: Der EquiCube
              reduziert Montage, Platzbedarf und Abstimmungsaufwand.
            </p>
            <div className="equicube-advantages__action">
              <Button to="/kontakt" variant="secondary">
                Jetzt anfragen!
              </Button>
            </div>
          </div>
          <ul className="equicube-advantages__list">
            {ADVANTAGES.map((advantage) => (
              <li key={advantage.number}>
                <span className="equicube-num">{advantage.number}</span>
                <div>
                  <strong>{advantage.title}</strong>
                  <p>{advantage.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        className="equicube-contact-cta"
        container="none"
        size="sm"
        aria-label="Kontaktaufruf"
        data-od-id="equicube-contact-cta"
      >
        <div className="equicube-cta-band">
          <div>
            <Kicker>Nächster Schritt</Kicker>
            <h2>Passt der EquiCube zu deinem Haus?</h2>
            <p>
              Schreib uns ein paar Zeilen zu deiner Ausgangslage. Wir schauen
              gemeinsam darauf.
            </p>
          </div>
          <div className="equicube-cta-actions">
            <Button to="/kontakt" icon={<ArrowIcon />}>
              Jetzt anfragen!
            </Button>
            <Button href="tel:+436504593129" variant="secondary">
              +43&nbsp;650&nbsp;4593&nbsp;129
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
