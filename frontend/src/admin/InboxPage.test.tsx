import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { AuthProvider } from "../auth/AuthContext";
import RequireAuth from "../auth/RequireAuth";
import { ApiError, request } from "../lib/api";
import AdminLayout from "./AdminLayout";
import InboxPage, { POLL_INTERVAL_MS } from "./InboxPage";
import InquiryPage from "./InquiryPage";
import LoginPage from "./LoginPage";
import type { InquiryDetail, InquiryStatus } from "./types";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return {
    ...actual,
    request: vi.fn(),
  };
});

const requestMock = vi.mocked(request) as unknown as Mock<
  (path: string, init?: RequestInit) => Promise<unknown>
>;

const DEMO_EMAIL = "demo@equicrew.com";

let authenticated = true;
let records: InquiryDetail[] = [];
let intervalCallbacks: Array<() => void> = [];

function createRecords(): InquiryDetail[] {
  return [
    {
      id: 3,
      first_name: "Anna",
      last_name: "Gruber",
      email: "anna.gruber@example.at",
      message:
        "Guten Tag, wir sanieren unser Einfamilienhaus und möchten die bestehende Heizung ersetzen.",
      created_at: "2026-10-14T06:42:00Z",
      status: "new",
    },
    {
      id: 2,
      first_name: "Markus",
      last_name: "Pichler",
      email: "markus.pichler@example.at",
      message:
        "Wir planen den Neubau eines Niedrigenergiehauses mit Fußbodenheizung.",
      created_at: "2026-10-13T15:15:00Z",
      status: "read",
    },
    {
      id: 1,
      first_name: "Lena",
      last_name: "Obermüller",
      email: "lena.obermueller@example.at",
      message:
        "Bitte um Rückruf bezüglich einer Wartungsanfrage für unsere Anlage.",
      created_at: "2026-10-09T07:12:00Z",
      status: "done",
    },
  ];
}

function unauthorised(): ApiError {
  return new ApiError(401, "Anmeldung erforderlich.");
}

function summaries() {
  return records.map(({ message, ...record }) => ({
    ...record,
    message_excerpt:
      message.length > 160 ? `${message.slice(0, 160)}…` : message,
  }));
}

function findByPath(path: string): InquiryDetail | undefined {
  const match = /^\/api\/inquiries\/(\d+)$/.exec(path);
  if (!match) {
    return undefined;
  }
  const id = Number(match[1]);
  return records.find((record) => record.id === id);
}

function installRequestMock(): void {
  requestMock.mockImplementation(async (path: string, init?: RequestInit) => {
    if (path === "/api/auth/me") {
      if (!authenticated) {
        throw unauthorised();
      }
      return { email: DEMO_EMAIL };
    }

    if (path === "/api/auth/logout") {
      authenticated = false;
      return undefined;
    }

    if (path === "/api/auth/login") {
      authenticated = true;
      return { email: DEMO_EMAIL };
    }

    if (path === "/api/inquiries") {
      if (!authenticated) {
        throw unauthorised();
      }
      return { items: summaries() };
    }

    const record = findByPath(path);
    if (path.startsWith("/api/inquiries/")) {
      if (!authenticated) {
        throw unauthorised();
      }
      if (!record) {
        throw new ApiError(404, "Anfrage nicht gefunden.");
      }
      if (init?.method === "PATCH") {
        const body = JSON.parse(String(init.body)) as {
          status: InquiryStatus;
        };
        const updated = { ...record, status: body.status };
        records = records.map((item) =>
          item.id === updated.id ? updated : item,
        );
        return updated;
      }
      return record;
    }

    throw new Error(`Unexpected request: ${path}`);
  });
}

function renderAdmin(initialPath = "/intern") {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/intern" element={<AdminLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route
              element={
                <RequireAuth>
                  <Outlet />
                </RequireAuth>
              }
            >
              <Route index element={<InboxPage />} />
              <Route path="anfragen/:id" element={<InquiryPage />} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

beforeEach(() => {
  authenticated = true;
  records = createRecords();
  intervalCallbacks = [];
  requestMock.mockReset();
  installRequestMock();

  vi.spyOn(window, "setInterval").mockImplementation(((
    handler: TimerHandler,
    delay?: number,
  ) => {
    if (typeof handler === "function" && delay === POLL_INTERVAL_MS) {
      intervalCallbacks.push(handler as () => void);
    }
    return intervalCallbacks.length;
  }) as typeof window.setInterval);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("InboxPage", () => {
  it("lists every inquiry newest first with its status label", async () => {
    renderAdmin();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Posteingang" }),
    ).toBeInTheDocument();

    const table = await screen.findByRole("table");
    await waitFor(() => {
      expect(within(table).getAllByRole("row")).toHaveLength(4);
    });

    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows[0]).toHaveTextContent("Anna Gruber");
    expect(rows[0]).toHaveTextContent("Neu");
    expect(rows[1]).toHaveTextContent("Markus Pichler");
    expect(rows[1]).toHaveTextContent("Gelesen");
    expect(rows[2]).toHaveTextContent("Lena Obermüller");
    expect(rows[2]).toHaveTextContent("Erledigt");
  });

  it("adds a newly stored inquiry on the next poll without reloading", async () => {
    renderAdmin();

    expect(await screen.findByText("Anna Gruber")).toBeInTheDocument();
    expect(screen.queryByText("Neue Anfrage")).not.toBeInTheDocument();

    records = [
      {
        id: 4,
        first_name: "Neue",
        last_name: "Anfrage",
        email: "neu@example.at",
        message: "Eine Anfrage, die während der Sitzung eingegangen ist.",
        created_at: "2026-10-15T08:00:00Z",
        status: "new",
      },
      ...records,
    ];

    expect(intervalCallbacks).toHaveLength(1);
    await act(async () => {
      intervalCallbacks[0]();
      await Promise.resolve();
    });

    expect(await screen.findByText("Neue Anfrage")).toBeInTheDocument();

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows[0]).toHaveTextContent("Neue Anfrage");
  });

  it("opens an inquiry, marks it done and shows the new status in the list", async () => {
    renderAdmin();

    fireEvent.click(await screen.findByText("Anna Gruber"));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Anna Gruber" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/wir sanieren unser Einfamilienhaus/),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("anna.gruber@example.at").length,
    ).toBeGreaterThan(0);

    fireEvent.click(
      screen.getByRole("button", { name: "Als erledigt markieren" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Status auf „Erledigt“ gesetzt."),
      ).toBeInTheDocument();
    });

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Anna Gruber",
    });
    expect(
      within(heading.parentElement as HTMLElement).getByText("Erledigt"),
    ).toBeInTheDocument();

    expect(requestMock).toHaveBeenCalledWith(
      "/api/inquiries/3",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "done" }),
      }),
    );

    fireEvent.click(
      screen.getByRole("link", { name: /Zurück zum Posteingang/ }),
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "Posteingang" }),
    ).toBeInTheDocument();

    const table = await screen.findByRole("table");
    await waitFor(() => {
      const row = within(table)
        .getAllByRole("row")
        .find((item) => item.textContent?.includes("Anna Gruber"));
      expect(row).toBeDefined();
      expect(row).toHaveTextContent("Erledigt");
    });
  });

  it("signs out and leads back to the sign-in", async () => {
    renderAdmin();

    await screen.findByRole("heading", { level: 1, name: "Posteingang" });

    fireEvent.click(screen.getByRole("button", { name: "Abmelden" }));

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Willkommen zurück.",
      }),
    ).toBeInTheDocument();

    expect(requestMock).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
