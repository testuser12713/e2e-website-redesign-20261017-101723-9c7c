import Button from "../components/Button";
import Card from "../components/Card";
import Kicker from "../components/Kicker";
import Section from "../components/Section";
import { usePageMeta } from "../lib/meta";
import "./About.css";

interface Founder {
  id: string;
  name: string;
  role: string;
  email: string;
  initials: string;
  portrait?: string;
}

const FOUNDERS: Founder[] = [
  {
    id: "founder-michael",
    name: "Michael Hochstöger",
    role: "Founder",
    email: "michael.hochstoeger@equicrew.com",
    initials: "MH",
  },
  {
    id: "founder-christian-hinterdorfer",
    name: "Christian Hinterdorfer",
    role: "Founder",
    email: "christian.hinterdorfer@equicrew.com",
    initials: "CH",
  },
  {
    id: "founder-christian-hinterreiter",
    name: "Christian Hinterreiter",
    role: "Founder",
    email: "christian.hinterreiter@equicrew.com",
    initials: "CH",
  },
];

const PRINCIPLES = [
  {
    index: "01",
    title: "Heizsysteme ohne Kopfzerbrechen",
    text: "Technik soll entlasten. Deshalb denken wir Systeme vom Alltag der Menschen her – nicht von der Zahl der Einzelkomponenten.",
  },
  {
    index: "02",
    title: "Grün und fair verteilte KI",
    text: "KI-Technologie braucht einen verantwortungsvollen Rahmen. Wir setzen sie für nachhaltige Energie und faire Chancen ein.",
  },
  {
    index: "03",
    title: "Gemeinsam statt nebeneinander",
    text: "Eine Crew, abgestimmte Komponenten und ein offener Dialog mit Kundinnen und Kunden – so entsteht ein stimmiges Ganzes.",
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

function FounderPortrait({ founder }: { founder: Founder }) {
  const label = `${founder.name}, ${founder.role} von EquiCrew`;

  return (
    <div className="about-founder-photo">
      {founder.portrait ? (
        <img
          src={founder.portrait}
          width={596}
          height={686}
          alt={label}
          loading="lazy"
        />
      ) : (
        <span className="about-founder-initials" role="img" aria-label={label}>
          {founder.initials}
        </span>
      )}
    </div>
  );
}

export default function About() {
  usePageMeta(
    "Über uns – die Crew hinter EquiCrew",
    "Jedes Schiff braucht eine Crew: Michael Hochstöger, Christian Hinterdorfer und Christian Hinterreiter von EquiCrew gehen gemeinsam den Weg zu Heizsystemen ohne Kopfzerbrechen und fair verteilter KI.",
  );

  return (
    <>
      <Section
        className="about-hero"
        container="none"
        aria-label="Über uns"
        data-od-id="about-hero"
      >
        <Kicker>Über uns</Kicker>
        <h1 className="about-hero__title">Jedes Schiff braucht eine Crew.</h1>
        <p className="about-hero__lede">
          Gemeinsam gehen wir den Weg zu Heizsystemen ohne Kopfzerbrechen – und
          zu grüner, fair verteilter KI-Technologie. Drei Founder, ein Anspruch:
          Energie und KI so einzusetzen, dass sie für die nächste Generation
          Sinn ergeben.
        </p>
      </Section>

      <Section
        className="about-team"
        size="sm"
        container="none"
        aria-label="EquiCrew Team"
        data-od-id="about-team-photo"
      >
        <figure className="about-team__figure">
          <figcaption className="about-team__caption">
            <span>Die Menschen hinter EquiCrew – gemeinsam in Mauthausen.</span>
            <span>EquiCrew FlexCo</span>
          </figcaption>
        </figure>
      </Section>

      <Section
        className="about-founders"
        container="none"
        aria-labelledby="founders-heading"
        data-od-id="about-founders"
      >
        <div className="about-section-head">
          <div>
            <Kicker>Die Founder</Kicker>
            <h2 id="founders-heading">
              Drei Perspektiven. Ein gemeinsamer Kurs.
            </h2>
          </div>
          <p className="about-lede">
            Gebäudetechnik, Energie und digitale Systeme zusammenbringen – dafür
            arbeitet die Crew täglich zusammen.
          </p>
        </div>

        <div className="about-founder-grid">
          {FOUNDERS.map((founder) => (
            <Card
              as="article"
              variant="founder"
              className="about-founder-card"
              data-od-id={founder.id}
              key={founder.id}
            >
              <FounderPortrait founder={founder} />
              <div className="about-founder-info">
                <h3>{founder.name}</h3>
                <p className="about-founder-role">{founder.role}</p>
                <a
                  className="about-founder-mail"
                  href={`mailto:${founder.email}`}
                >
                  {founder.email}
                </a>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="about-principles-section"
        tint
        container="none"
        aria-labelledby="principles-heading"
        data-od-id="about-principles"
      >
        <div className="about-section-head">
          <div>
            <Kicker>Unser Weg</Kicker>
            <h2 id="principles-heading">Woran wir uns orientieren.</h2>
          </div>
        </div>

        <div className="about-principles-grid">
          {PRINCIPLES.map((principle) => (
            <article className="about-principle" key={principle.index}>
              <span className="about-principle__index">{principle.index}</span>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        className="about-cta"
        size="sm"
        container="none"
        aria-label="Kontaktaufruf"
        data-od-id="about-contact-cta"
      >
        <div className="about-cta-band">
          <div>
            <Kicker>Kontakt</Kicker>
            <h2>Lass uns gemeinsam auf Kurs gehen.</h2>
            <p>Du hast Fragen zum EquiCube oder zu deinem Heizsystem? Wir hören zu.</p>
          </div>
          <div className="about-cta-actions">
            <Button to="/kontakt" icon={<ArrowIcon />}>
              Jetzt anfragen
            </Button>
            <Button href="mailto:office@equicrew.com" variant="secondary">
              office@equicrew.com
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
