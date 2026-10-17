import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { request } from "../lib/api";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export interface AuthContextValue {
  status: AuthStatus;
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface MeResponse {
  email: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [email, setEmail] = useState<string | null>(null);

  const loadCurrentUser = useCallback(async (): Promise<MeResponse | null> => {
    try {
      const me = await request<MeResponse>("/api/auth/me");
      setEmail(me.email);
      setStatus("authenticated");
      return me;
    } catch {
      setEmail(null);
      setStatus("anonymous");
      return null;
    }
  }, []);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser]);

  const login = useCallback(
    async (emailAddress: string, password: string): Promise<void> => {
      await request<MeResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: emailAddress, password }),
      });

      const me = await loadCurrentUser();
      if (!me) {
        throw new Error("Die Anmeldung konnte nicht bestätigt werden.");
      }
    },
    [loadCurrentUser],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await request<void>("/api/auth/logout", { method: "POST" });
    } catch {
      // The local session is cleared regardless of the network outcome.
    } finally {
      setEmail(null);
      setStatus("anonymous");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      email,
      login,
      logout,
    }),
    [status, email, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
