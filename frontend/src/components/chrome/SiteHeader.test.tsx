import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import SiteHeader from "./SiteHeader";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SiteHeader />
    </MemoryRouter>,
  );
}

describe("SiteHeader call-to-action", () => {
  it.each(["/", "/equicube", "/ueber-uns", "/impressum"])(
    "links to the contact page from %s",
    (path) => {
      renderAt(path);

      const request = screen.getByRole("link", { name: "Jetzt anfragen" });
      expect(request).toHaveAttribute("href", "/kontakt");
      expect(
        screen.queryByRole("link", { name: "Zum Formular" }),
      ).not.toBeInTheDocument();
    },
  );

  it("sends the call-to-action on the contact page to the form instead of the page itself", () => {
    renderAt("/kontakt");

    const toForm = screen.getByRole("link", { name: "Zum Formular" });
    expect(toForm).toHaveAttribute("href", "#contact-form-heading");
    expect(
      screen.queryByRole("link", { name: "Jetzt anfragen" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the contact navigation entry marked as the current page", () => {
    renderAt("/kontakt");

    const navigation = screen.getByRole("navigation", {
      name: "Hauptnavigation",
    });
    expect(
      screen.getByRole("link", { name: "Kontakt", current: "page" }),
    ).toBeInTheDocument();
    expect(navigation).toBeInTheDocument();
  });
});
