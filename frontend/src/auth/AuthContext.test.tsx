import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { request } from "../lib/api";
import RequireAuth from "./RequireAuth";
import { AuthProvider, useAuth } from "./AuthContext";

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
const DEMO_PASSWORD = "EquiCrew-Demo-2026";

function AuthHarness() {
  const { status, email, login, logout } = useAuth();
  const [error, setError] = useState("");

  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="email">{email ?? ""}</span>
      <span data-testid="error">{error}</span>
      <button
        type="button"
        onClick={() => {
          login(DEMO_EMAIL, DEMO_PASSWORD).catch(() => setError("failed"));
        }}
      >
        Anmelden
      </button>
      <button type="button" onClick={() => void logout()}>
        Abmelden
      </button>
    </div>
  );
}

function renderHarness() {
  return render(
    <AuthProvider>
      <AuthHarness />
    </AuthProvider>,
  );
}

function unauthorised(): Promise<never> {
  return Promise.reject(new Error("401"));
}

describe("AuthProvider", () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  it("hydrates from the current session", async () => {
    let resolveMe: (value: unknown) => void = () => {};
    requestMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveMe = resolve;
        }),
    );

    renderHarness();

    expect(screen.getByTestId("status")).toHaveTextContent("loading");

    resolveMe({ email: DEMO_EMAIL });

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });
    expect(screen.getByTestId("email")).toHaveTextContent(DEMO_EMAIL);
    expect(requestMock).toHaveBeenCalledWith("/api/auth/me");
  });

  it("signs in and re-reads the session state", async () => {
    let signedIn = false;

    requestMock.mockImplementation(async (path: string) => {
      if (path === "/api/auth/login") {
        signedIn = true;
        return { email: DEMO_EMAIL };
      }
      if (path === "/api/auth/me") {
        if (signedIn) {
          return { email: DEMO_EMAIL };
        }
        return unauthorised();
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    renderHarness();

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("anonymous");
    });

    fireEvent.click(screen.getByRole("button", { name: "Anmelden" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    expect(screen.getByTestId("email")).toHaveTextContent(DEMO_EMAIL);
    expect(requestMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
      }),
    );
    expect(requestMock).toHaveBeenCalledTimes(3);
  });

  it("stays anonymous when the credentials are rejected", async () => {
    requestMock.mockImplementation(async (path: string) => {
      if (path === "/api/auth/login") {
        throw new Error("401");
      }
      return unauthorised();
    });

    renderHarness();

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("anonymous");
    });

    fireEvent.click(screen.getByRole("button", { name: "Anmelden" }));

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("failed");
    });
    expect(screen.getByTestId("status")).toHaveTextContent("anonymous");
    expect(screen.getByTestId("email")).toBeEmptyDOMElement();
  });

  it("clears the session on sign-out", async () => {
    requestMock.mockImplementation(async (path: string) => {
      if (path === "/api/auth/logout") {
        return undefined;
      }
      return { email: DEMO_EMAIL };
    });

    renderHarness();

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    fireEvent.click(screen.getByRole("button", { name: "Abmelden" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("anonymous");
    });
    expect(screen.getByTestId("email")).toBeEmptyDOMElement();
    expect(requestMock).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("RequireAuth", () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  it("redirects an anonymous visitor to the sign-in page", async () => {
    requestMock.mockImplementation(async () => unauthorised());

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/intern"]}>
          <Routes>
            <Route path="/intern/login" element={<p>Anmeldeseite</p>} />
            <Route
              path="/intern"
              element={
                <RequireAuth>
                  <p>Interner Bereich</p>
                </RequireAuth>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByText("Anmeldeseite")).toBeInTheDocument();
    expect(screen.queryByText("Interner Bereich")).not.toBeInTheDocument();
  });

  it("renders the protected content for a signed-in visitor", async () => {
    requestMock.mockImplementation(async () => ({ email: DEMO_EMAIL }));

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/intern"]}>
          <Routes>
            <Route path="/intern/login" element={<p>Anmeldeseite</p>} />
            <Route
              path="/intern"
              element={
                <RequireAuth>
                  <p>Interner Bereich</p>
                </RequireAuth>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByText("Interner Bereich")).toBeInTheDocument();
    expect(screen.queryByText("Anmeldeseite")).not.toBeInTheDocument();
  });
});
