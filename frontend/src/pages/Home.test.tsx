import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Home from "./Home";

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

function section(id: string): Element | null {
  return document.querySelector(`[data-od-id="${id}"]`);
}

describe("Home page", () => {
  it("sets its own German title and meta description", () => {
    renderHome();

    expect(document.title).toContain("Start");
    expect(document.title).toContain("EquiCrew");

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    expect(description).not.toBeNull();
    expect(description?.content).toContain("EquiCrew");
    expect(description?.content).toContain("EquiCube");
  });

  it("renders the hero, mission, product, crew and contact sections", () => {
    renderHome();

    const hero = section("home-hero");
    expect(hero).not.toBeNull();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /equicrew – smarte energie · fair verteilte KI/i,
      }),
    ).toBeInTheDocument();
    expect(section("home-equicube-visual")).not.toBeNull();

    expect(section("home-mission")).not.toBeNull();
    expect(
      screen.getByText(/Energie und KI sollen nicht nur funktionieren/i),
    ).toBeInTheDocument();

    expect(section("home-product")).not.toBeNull();
    expect(
      screen.getByRole("heading", {
        name: "Ein Cube. Ein System. Keine Insellösungen.",
      }),
    ).toBeInTheDocument();
    expect(section("home-product-image")).not.toBeNull();

    expect(section("home-crew")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Jedes Schiff braucht eine Crew." }),
    ).toBeInTheDocument();

    expect(section("home-contact-cta")).not.toBeNull();
    expect(
      screen.getByRole("heading", {
        name: "Bereit für ein Heizsystem ohne Kopfzerbrechen?",
      }),
    ).toBeInTheDocument();
  });

  it("lists the four EquiCube features and the three founders", () => {
    renderHome();

    for (const feature of [
      "Standardisierter Basis-Cube",
      "Modular anpassbar",
      "Für Fußboden- und Radiatorenheizung",
      "Heizleistung bis 40 kW",
    ]) {
      expect(screen.getByText(feature)).toBeInTheDocument();
    }

    for (const founder of [
      "Michael Hochstöger",
      "Christian Hinterdorfer",
      "Christian Hinterreiter",
    ]) {
      expect(screen.getByText(founder)).toBeInTheDocument();
    }
  });

  it("points every link and button at the page it promises", () => {
    renderHome();

    expect(
      screen.getByRole("link", { name: /EquiCube entdecken/i }),
    ).toHaveAttribute("href", "/equicube");
    expect(
      screen.getByRole("link", { name: "EquiCube im Detail" }),
    ).toHaveAttribute("href", "/equicube");

    const contactLinks = screen.getAllByRole("link", {
      name: /Jetzt anfragen/i,
    });
    expect(contactLinks).toHaveLength(2);
    for (const link of contactLinks) {
      expect(link).toHaveAttribute("href", "/kontakt");
    }

    expect(
      screen.getByRole("link", { name: "Die Crew kennenlernen" }),
    ).toHaveAttribute("href", "/ueber-uns");

    expect(
      screen.getByRole("link", { name: /\+43\s?650\s?4593\s?129/ }),
    ).toHaveAttribute("href", "tel:+436504593129");
  });
});
