import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import EquiCube from "./EquiCube";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/equicube"]}>
      <EquiCube />
    </MemoryRouter>,
  );
}

const SECTIONS = [
  "equicube-hero",
  "equicube-product-visual",
  "equicube-features",
  "equicube-advantages",
  "equicube-contact-cta",
];

const FEATURE_TITLES = [
  "Standardisierter Basis-Cube",
  "Modular anpassbar",
  "Für Fußboden- und Radiatorenheizung",
  "Heizleistung bis 40 kW",
];

const ADVANTAGE_TITLES = [
  "Installation in über 2 Stunden",
  "Einfache Wartbarkeit",
  "Abgestimmte Komponenten aus einer Hand",
  "Minimierter Platzbedarf",
];

const CUBE_MODULES = [
  "Wärmepumpe",
  "Batterie",
  "PV-Technik",
  "Pufferspeicher",
  "KI-Technik",
];

describe("EquiCube page", () => {
  it("fills the hero visual card with the EquiCube composition", () => {
    const { container } = renderPage();

    const visual = container.querySelector<HTMLElement>(
      '[data-od-id="equicube-product-visual"]',
    );
    expect(visual).not.toBeNull();
    if (!visual) {
      return;
    }

    const card = within(visual);

    expect(card.getByText("EquiCube · ein System")).toBeInTheDocument();
    expect(card.getByText("bis 40 kW")).toBeInTheDocument();
    expect(
      card.getByText("Heizleistung für Einfamilienhäuser"),
    ).toBeInTheDocument();
    expect(
      card.getByText(/EquiCube mit Wärmepumpe, Batterie, PV-Technik/),
    ).toBeInTheDocument();

    for (const module of CUBE_MODULES) {
      expect(card.getByText(module)).toBeInTheDocument();
    }

    expect(visual.querySelector("img")).toHaveAttribute(
      "src",
      "/equicrew-mark.svg",
    );
    expect(visual.querySelectorAll("li")).toHaveLength(CUBE_MODULES.length);
  });

  it("renders every section of the approved screen", () => {
    const { container } = renderPage();

    for (const section of SECTIONS) {
      expect(
        container.querySelector(`[data-od-id="${section}"]`),
        `expected the page to render "${section}"`,
      ).not.toBeNull();
    }

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Wärme, Strom und KI. In einem Cube.",
      }),
    ).toBeInTheDocument();
  });

  it("shows the four characteristics and the four advantages", () => {
    renderPage();

    for (const title of FEATURE_TITLES) {
      expect(
        screen.getByRole("heading", { level: 3, name: title }),
      ).toBeInTheDocument();
    }

    for (const title of ADVANTAGE_TITLES) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it("leads every request call to the contact page", () => {
    renderPage();

    const calls = screen.getAllByRole("link", { name: /Jetzt anfragen!/i });

    expect(calls.length).toBeGreaterThanOrEqual(3);
    for (const call of calls) {
      expect(call).toHaveAttribute("href", "/kontakt");
    }
  });

  it("sets its own German title and meta description", () => {
    renderPage();

    expect(document.title).toContain("EquiCube");
    expect(document.title).toContain("EquiCrew");

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    expect(description?.content).toContain("EquiCube");
    expect(description?.content).toContain("Einfamilienhäuser");
  });
});
