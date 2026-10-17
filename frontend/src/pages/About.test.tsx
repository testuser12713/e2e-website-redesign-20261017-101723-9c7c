import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import About from "./About";

function renderAbout() {
  return render(
    <MemoryRouter initialEntries={["/ueber-uns"]}>
      <About />
    </MemoryRouter>,
  );
}

const FOUNDERS = [
  ["Michael Hochstöger", "michael.hochstoeger@equicrew.com", "MH"],
  ["Christian Hinterdorfer", "christian.hinterdorfer@equicrew.com", "CH"],
  ["Christian Hinterreiter", "christian.hinterreiter@equicrew.com", "CH"],
];

describe("About page", () => {
  it("renders the crew introduction and the founders section", () => {
    renderAbout();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Jedes Schiff braucht eine Crew.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Drei Perspektiven. Ein gemeinsamer Kurs.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Gemeinsam gehen wir den Weg zu Heizsystemen/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Jetzt anfragen/ }),
    ).toHaveAttribute("href", "/kontakt");
  });

  it("sets its own title and meta description", () => {
    renderAbout();

    expect(document.title).toBe("Über uns – die Crew hinter EquiCrew");

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    expect(description?.content).toContain("Michael Hochstöger");
    expect(description?.content).toContain("Christian Hinterdorfer");
    expect(description?.content).toContain("Christian Hinterreiter");
  });

  it("shows recognisable imagery in the team figure", () => {
    renderAbout();

    const section = document.querySelector<HTMLElement>(
      '[data-od-id="about-team-photo"]',
    );
    expect(section).not.toBeNull();

    const figure = section?.querySelector("figure");
    expect(figure).not.toBeNull();

    const image = within(figure as HTMLElement).getByRole("img");
    expect(image.getAttribute("src")).toMatch(/^\/media\/.+\.jpe?g$/);
    expect(image).toHaveAttribute("alt");
    expect(image.getAttribute("alt")).not.toBe("");
  });

  it.each(FOUNDERS)(
    "shows %s with role, e-mail and initials avatar",
    (name, email, initials) => {
      renderAbout();

      const heading = screen.getByRole("heading", { level: 3, name });
      const card = heading.closest("article");
      expect(card).not.toBeNull();

      const scope = within(card as HTMLElement);
      expect(scope.getByText("Founder")).toBeInTheDocument();
      expect(
        scope.getByRole("link", { name: email }),
      ).toHaveAttribute("href", `mailto:${email}`);
      expect(
        scope.getByRole("img", {
          name: `${name}, Founder von EquiCrew`,
        }),
      ).toHaveTextContent(initials);
    },
  );
});
