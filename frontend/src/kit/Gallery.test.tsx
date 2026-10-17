import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Gallery from "./Gallery";

function renderGallery() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Gallery />
    </MemoryRouter>,
  );
}

const COMPONENT_STATES = [
  "button-primary",
  "button-secondary",
  "button-ghost",
  "button-on-dark",
  "button-sm",
  "button-block",
  "button-disabled",
  "button-loading",
  "button-icon",
  "button-link",
  "field-default",
  "field-error",
  "field-full",
  "input-default",
  "input-error",
  "input-disabled",
  "textarea-default",
  "textarea-error",
  "textarea-disabled",
  "badge-new",
  "badge-read",
  "badge-done",
  "card-default",
  "card-feature",
  "card-founder",
  "card-message",
  "card-side",
  "card-panel",
  "card-legal",
  "card-form",
  "section-default",
  "section-sm",
  "section-tint",
  "alert-success",
  "alert-error",
  "alert-inline",
  "empty-state",
  "avatar-sm",
  "avatar-md",
  "avatar-lg",
  "avatar-dark",
  "brand-light",
  "brand-dark",
  "kicker-default",
  "kicker-light",
  "social-links",
  "arrow-link",
  "text-link",
  "site-header-example",
  "site-footer-example",
];

describe("UI-kit gallery", () => {
  it("renders every component in every required state", () => {
    renderGallery();

    for (const testId of COMPONENT_STATES) {
      expect(
        screen.getByTestId(testId),
        `expected the gallery to render "${testId}"`,
      ).toBeInTheDocument();
    }

    expect(screen.getByTestId("badge-new")).toHaveTextContent("Neu");
    expect(screen.getByTestId("badge-read")).toHaveTextContent("Gelesen");
    expect(screen.getByTestId("badge-done")).toHaveTextContent("Erledigt");

    const loading = within(screen.getByTestId("button-loading")).getByRole(
      "button",
    );
    expect(loading).toBeDisabled();
    expect(loading).toHaveAttribute("aria-busy", "true");
    expect(loading).toHaveTextContent("Wird gesendet …");

    expect(
      within(screen.getByTestId("button-disabled")).getByRole("button"),
    ).toBeDisabled();

    for (const testId of ["input-error", "textarea-error"]) {
      expect(within(screen.getByTestId(testId)).getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    }

    const fieldError = screen.getByTestId("field-error");
    expect(fieldError.querySelector(".field")).toHaveClass("has-error");
    expect(fieldError).toHaveTextContent(
      "Bitte gib eine gültige E-Mail-Adresse ein.",
    );

    expect(
      within(screen.getByTestId("alert-success")).getByRole("status"),
    ).toHaveTextContent("Danke für deine Nachricht!");
    expect(
      within(screen.getByTestId("alert-error")).getByRole("alert"),
    ).toHaveTextContent("Deine Nachricht konnte nicht gespeichert werden.");
    expect(
      within(screen.getByTestId("alert-inline")).getByRole("alert"),
    ).toHaveTextContent("E-Mail-Adresse oder Passwort ist nicht korrekt.");

    expect(
      within(screen.getByTestId("empty-state")).getByRole("heading", {
        name: "Noch keine Anfragen",
      }),
    ).toBeInTheDocument();
  });

  it("renders the public header with navigation to all five pages", () => {
    renderGallery();

    const navigation = screen.getByRole("navigation", {
      name: "Hauptnavigation",
    });
    const links = within(navigation).getAllByRole("link");

    expect(links).toHaveLength(5);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/",
      "/equicube",
      "/ueber-uns",
      "/kontakt",
      "/impressum",
    ]);
    expect(
      within(navigation).getByRole("link", { name: "Start" }),
    ).toHaveAttribute("aria-current", "page");

    expect(
      document.querySelector(
        '.site-header .brand img[src="/equicrew-mark.svg"]',
      ),
    ).not.toBeNull();

    expect(
      within(screen.getByTestId("site-header-example")).getByRole("link", {
        name: "equicrew smart energy – Startseite",
      }),
    ).toHaveAttribute("href", "/");
  });

  it("renders the footer with contact data, social links and the legal route", () => {
    renderGallery();

    const footer = screen.getByTestId("site-footer-example");

    expect(
      within(footer).getByRole("link", { name: "EquiCrew auf LinkedIn" }),
    ).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/equicrew/",
    );
    expect(
      within(footer).getByRole("link", { name: "EquiCrew auf Instagram" }),
    ).toHaveAttribute("href", "https://www.instagram.com/equicrew_com/");

    expect(
      within(footer).getByRole("link", {
        name: /\+43\s*650\s*4593\s*129/,
      }),
    ).toHaveAttribute("href", "tel:+436504593129");
    expect(
      within(footer).getByRole("link", { name: "office@equicrew.com" }),
    ).toHaveAttribute("href", "mailto:office@equicrew.com");

    const legalLinks = within(footer).getAllByRole("link", {
      name: "Impressum",
    });
    expect(legalLinks.length).toBeGreaterThan(0);
    for (const link of legalLinks) {
      expect(link).toHaveAttribute("href", "/impressum");
    }

    const internalLinks = within(footer).getAllByRole("link", {
      name: "Interner Bereich",
    });
    expect(internalLinks.length).toBeGreaterThan(0);
    for (const link of internalLinks) {
      expect(link).toHaveAttribute("href", "/intern/login");
    }
  });

  it("does not lock the page when the mobile toggle is triggered at desktop width", () => {
    renderGallery();

    const toggle = screen.getByTestId("gallery-nav-toggle");

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.body).not.toHaveClass("menu-open");
  });

  it("opens and closes the mobile navigation with the toggle", () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 360,
    });

    try {
      renderGallery();

      const toggle = screen.getByTestId("gallery-nav-toggle");
      const navigation = screen.getByRole("navigation", {
        name: "Hauptnavigation",
      });

      expect(toggle).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(toggle).toHaveTextContent("Schließen");
      expect(navigation).toHaveClass("is-open");
      expect(document.body).toHaveClass("menu-open");

      fireEvent.keyDown(document, { key: "Escape" });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(toggle).toHaveTextContent("Menü");
      expect(navigation).not.toHaveClass("is-open");
      expect(document.body).not.toHaveClass("menu-open");
    } finally {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: originalWidth,
      });
    }
  });
});
