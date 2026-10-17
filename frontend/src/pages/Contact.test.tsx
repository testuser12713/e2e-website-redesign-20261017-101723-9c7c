import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, request } from "../lib/api";
import Contact from "./Contact";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, request: vi.fn() };
});

const mockedRequest = vi.mocked(request);

const REQUIRED_MESSAGES = [
  "Bitte gib deinen Vornamen ein.",
  "Bitte gib deinen Nachnamen ein.",
  "Bitte gib deine E-Mail-Adresse ein.",
  "Bitte gib eine Nachricht ein.",
];

function input(label: string): HTMLInputElement {
  return screen.getByLabelText(new RegExp(`^${label}`)) as HTMLInputElement;
}

function fillValidForm() {
  fireEvent.change(input("Vorname"), { target: { value: "Anna" } });
  fireEvent.change(input("Nachname"), { target: { value: "Gruber" } });
  fireEvent.change(input("E-Mail-Adresse"), {
    target: { value: "anna.gruber@beispiel.at" },
  });
  fireEvent.change(input("Nachricht"), {
    target: { value: "Wir planen eine neue Heizung für unser Haus." },
  });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: /Nachricht senden/ }));
}

describe("Kontaktseite", () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it("shows no error on an untouched, empty form", () => {
    render(<Contact />);

    expect(document.title).toContain("Kontakt");
    expect(input("Vorname")).toHaveValue("");
    expect(input("Nachname")).toHaveValue("");
    expect(input("E-Mail-Adresse")).toHaveValue("");
    expect(input("Nachricht")).toHaveValue("");

    for (const message of REQUIRED_MESSAGES) {
      expect(screen.queryByText(message)).not.toBeInTheDocument();
    }

    for (const label of ["Vorname", "Nachname", "E-Mail-Adresse", "Nachricht"]) {
      expect(input(label)).not.toHaveAttribute("aria-invalid", "true");
    }
  });

  it("marks each field with its message when an invalid form is submitted", () => {
    render(<Contact />);

    submit();

    for (const message of REQUIRED_MESSAGES) {
      expect(screen.getByText(message)).toBeInTheDocument();
    }
    expect(mockedRequest).not.toHaveBeenCalled();
  });

  it("shows the confirmation and clears every field after a successful submit", async () => {
    mockedRequest.mockResolvedValue({ id: 42 });
    render(<Contact />);

    fillValidForm();
    submit();

    expect(
      await screen.findByText("Danke für deine Nachricht!"),
    ).toBeInTheDocument();

    expect(mockedRequest).toHaveBeenCalledTimes(1);
    const [path, init] = mockedRequest.mock.calls[0];
    expect(path).toBe("/api/contact");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      first_name: "Anna",
      last_name: "Gruber",
      email: "anna.gruber@beispiel.at",
      message: "Wir planen eine neue Heizung für unser Haus.",
    });

    expect(input("Vorname")).toHaveValue("");
    expect(input("Nachname")).toHaveValue("");
    expect(input("E-Mail-Adresse")).toHaveValue("");
    expect(input("Nachricht")).toHaveValue("");
  });

  it("keeps every entry after a failed save and allows a retry", async () => {
    mockedRequest.mockRejectedValue(new ApiError(500, "Internal Server Error"));
    render(<Contact />);

    fillValidForm();
    submit();

    expect(
      await screen.findByText(
        "Deine Nachricht konnte nicht gespeichert werden.",
      ),
    ).toBeInTheDocument();

    expect(input("Vorname")).toHaveValue("Anna");
    expect(input("Nachname")).toHaveValue("Gruber");
    expect(input("E-Mail-Adresse")).toHaveValue("anna.gruber@beispiel.at");
    expect(input("Nachricht")).toHaveValue(
      "Wir planen eine neue Heizung für unser Haus.",
    );

    mockedRequest.mockResolvedValueOnce({ id: 7 });
    submit();

    expect(
      await screen.findByText("Danke für deine Nachricht!"),
    ).toBeInTheDocument();
    expect(mockedRequest).toHaveBeenCalledTimes(2);
  });

  it("maps 422 field errors from the API onto their fields", async () => {
    mockedRequest.mockRejectedValue(
      new ApiError(422, [
        {
          field: "email",
          message: "Bitte gib eine gültige E-Mail-Adresse ein.",
        },
      ]),
    );
    render(<Contact />);

    fillValidForm();
    submit();

    expect(
      await screen.findByText("Bitte gib eine gültige E-Mail-Adresse ein."),
    ).toBeInTheDocument();
    expect(input("E-Mail-Adresse")).toHaveAttribute("aria-invalid", "true");
    expect(input("Vorname")).toHaveValue("Anna");
  });
});
