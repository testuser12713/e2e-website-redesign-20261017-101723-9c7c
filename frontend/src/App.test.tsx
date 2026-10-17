import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";
import globalCss from "./styles/global.css?inline";
import tokensCss from "./styles/tokens.css?inline";

function renderAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

describe("frontend shell", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renders the public page inside the shared layout frame", () => {
    renderAt("/");

    const header = screen.getByRole("banner");
    const main = screen.getByRole("main");
    const footer = screen.getByRole("contentinfo");

    expect(header).toBeInTheDocument();
    expect(main).toHaveAttribute("id", "main-content");
    expect(footer).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /equicrew/i }),
    ).toBeInTheDocument();
  });

  it("shows the logo and all five public navigation links", () => {
    renderAt("/");

    const navigation = screen.getByRole("navigation", {
      name: "Hauptnavigation",
    });

    expect(within(navigation).getAllByRole("link")).toHaveLength(5);
    expect(within(navigation).getByRole("link", { name: "EquiCube" })).toHaveAttribute(
      "href",
      "/equicube",
    );
    expect(
      document.querySelector('.site-brand img[src="/equicrew-mark.svg"]'),
    ).not.toBeNull();
    expect(within(navigation).getByRole("link", { name: "Start" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it.each([
    ["/", "Start"],
    ["/equicube", "EquiCube"],
    ["/ueber-uns", "Über uns"],
    ["/kontakt", "Kontakt"],
    ["/impressum", "Impressum"],
  ])("routes %s through the layout with its own metadata", (path, label) => {
    renderAt(path);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(document.title).toContain(label);

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    expect(description).not.toBeNull();
    expect(description?.content).toContain("EquiCrew");
  });

  it("applies the design tokens to the shell", () => {
    renderAt("/");

    expect(tokensCss).toContain("--color-primary: #0b7057");
    expect(tokensCss).toContain("--font-display:");
    expect(tokensCss).toContain("--space-4: 1rem");
    expect(tokensCss).toContain("--radius-md: 0.75rem");

    const style = document.createElement("style");
    style.textContent = tokensCss;
    document.head.appendChild(style);
    try {
      const rootStyle = getComputedStyle(document.documentElement);
      expect(rootStyle.getPropertyValue("--color-primary").trim()).toBe(
        "#0b7057",
      );
      expect(rootStyle.getPropertyValue("--space-4").trim()).toBe("1rem");
    } finally {
      style.remove();
    }

    expect(screen.getByRole("banner")).toHaveClass("site-header");
    expect(globalCss).toMatch(/\.site-header\s*\{[^}]*var\(--color-bg\)/);
    expect(globalCss).toMatch(/\.site-main\s*\{[^}]*var\(--space-7\)/);
    expect(globalCss).toMatch(/body\s*\{[^}]*var\(--font-body\)/);
  });

  it("redirects anonymous visitors from the inbox to the sign-in page", async () => {
    renderAt("/intern");

    expect(
      await screen.findByRole("heading", { name: "Anmeldung" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(window.location.pathname).toBe("/intern/login");
    });
  });

  it("renders a readable not-found page inside the layout for unknown routes", () => {
    renderAt("/diese-seite-gibt-es-nicht");

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Seite nicht gefunden" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Zur Startseite" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("registers the development-only gallery route", async () => {
    renderAt("/kit");

    expect(
      await screen.findByRole("heading", { name: "UI-Kit" }),
    ).toBeInTheDocument();
  });
});
