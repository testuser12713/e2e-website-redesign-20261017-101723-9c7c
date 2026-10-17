import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Legal from "./Legal";

function renderLegal() {
  return render(
    <MemoryRouter initialEntries={["/impressum"]}>
      <Legal />
    </MemoryRouter>,
  );
}

describe("Legal page", () => {
  it("renders the complete company data block", () => {
    renderLegal();

    expect(
      screen.getByRole("heading", { level: 1, name: "Impressum." }),
    ).toBeInTheDocument();
    expect(screen.getByText("EquiCrew FlexCo")).toBeInTheDocument();
    expect(
      screen.getByText("FlexCo (Flexible Kapitalgesellschaft)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Mauthausen, Österreich")).toBeInTheDocument();

    const address = screen.getByText(/Marktplatz 14/);
    expect(address).toHaveTextContent("Marktplatz 14");
    expect(address).toHaveTextContent("4310 Mauthausen");
    expect(address).toHaveTextContent("Österreich");

    expect(screen.getByText("FN 648043 f")).toBeInTheDocument();
    expect(screen.getByText("Wien")).toBeInTheDocument();
    expect(screen.getByText("ATU82132979")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Entwicklung von innovativen und nachhaltigen Produkten.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(/Michael Hochstöger/)).toHaveTextContent(
      "michael.hochstoeger@equicrew.com",
    );
    expect(screen.getByText(/Christian Hinterdorfer/)).toHaveTextContent(
      "christian.hinterdorfer@equicrew.com",
    );
    expect(screen.getByText(/Christian Hinterreiter/)).toHaveTextContent(
      "christian.hinterreiter@equicrew.com",
    );

    expect(
      screen.getByRole("link", { name: /\+43\s*650\s*4593\s*129/ }),
    ).toHaveAttribute("href", "tel:+436504593129");
    const emailLinks = screen.getAllByRole("link", {
      name: "office@equicrew.com",
    });
    expect(emailLinks.length).toBeGreaterThan(0);
    for (const link of emailLinks) {
      expect(link).toHaveAttribute("href", "mailto:office@equicrew.com");
    }
  });

  it("sets its own page title and meta description", () => {
    renderLegal();

    expect(document.title).toBe("Impressum – EquiCrew FlexCo");
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.content,
    ).toContain("EquiCrew FlexCo");
  });
});
