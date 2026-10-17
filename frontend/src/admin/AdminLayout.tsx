import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Avatar from "../components/Avatar";
import { useAuth } from "../auth/AuthContext";
import { request } from "../lib/api";
import { cn } from "../lib/cn";
import type { InquiryList } from "./types";
import "./AdminLayout.css";

interface InquiryCountContextValue {
  setInquiryCount: (count: number) => void;
}

const InquiryCountContext = createContext<InquiryCountContextValue | null>(
  null,
);

export function useInquiryCountSetter(): ((count: number) => void) | null {
  return useContext(InquiryCountContext)?.setInquiryCount ?? null;
}

function MailGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m3.6 6 6.4 4.5L16.4 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 10h12M11 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M8 4H5.5A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8M12.5 13l3-3-3-3M15 10H8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PublicSiteGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7 4H5.5A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H7M12 13l3-3-3-3M15 10H8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminLayout() {
  const { email, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [inquiryCount, setInquiryCount] = useState(0);

  const isLoginRoute = location.pathname === "/intern/login";
  const onDetail =
    location.pathname.startsWith("/intern/anfragen/") &&
    location.pathname !== "/intern/anfragen/";

  useEffect(() => {
    if (isLoginRoute) {
      return;
    }

    let active = true;
    request<InquiryList>("/api/inquiries")
      .then((data) => {
        if (active) {
          setInquiryCount(data.items.length);
        }
      })
      .catch(() => {
        /* The inbox surfaces a readable error itself; the counter stays quiet. */
      });

    return () => {
      active = false;
    };
  }, [isLoginRoute, location.pathname]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/intern/login", { replace: true });
  }, [logout, navigate]);

  const countContext = useMemo<InquiryCountContextValue>(
    () => ({ setInquiryCount }),
    [],
  );

  if (isLoginRoute) {
    return (
      <div className="intern-login-shell">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="intern-shell">
      <a className="skip-link" href="#intern-main">
        Zum Inhalt springen
      </a>

      <aside className="intern-sidebar" aria-label="Interne Navigation">
        <Link
          className="intern-brand"
          to="/intern"
          aria-label="equicrew intern – Posteingang"
        >
          <img
            className="intern-brand__mark"
            src="/equicrew-mark.svg"
            width={31}
            height={31}
            alt=""
          />
          <span>
            <span className="intern-brand__word">equicrew</span>
            <span className="intern-brand__sub">intern</span>
          </span>
        </Link>

        <p className="intern-context">Anfragen verwalten</p>
        <nav className="intern-nav" aria-label="Interner Bereich">
          <NavLink
            to="/intern"
            className={({ isActive }) =>
              cn("intern-nav__link", isActive && "is-active")
            }
          >
            <MailGlyph />
            <span>Posteingang</span>
            <span className="intern-nav__count">{inquiryCount}</span>
          </NavLink>
        </nav>

        <div className="intern-sidebar__bottom">
          <div className="intern-account">
            <Avatar initials="EC" tone="dark" />
            <div>
              <p className="intern-account__name">EquiCrew Team</p>
              <p className="intern-account__mail">{email ?? "—"}</p>
            </div>
          </div>
          <div className="intern-sidebar__actions">
            <Link
              className="intern-sidebar-action"
              to="/"
              aria-label="Zur Website"
            >
              <ArrowGlyph />
              <span>Zur Website</span>
            </Link>
            <button
              className="intern-sidebar-action"
              type="button"
              onClick={() => void handleLogout()}
              aria-label="Abmelden"
            >
              <LogoutGlyph />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="intern-main" id="intern-main" tabIndex={-1}>
        <div className="intern-topbar">
          <span className="intern-topbar__context">
            Interner Bereich <span aria-hidden="true">/</span> Posteingang
            {onDetail ? (
              <>
                {" "}
                <span aria-hidden="true">/</span>{" "}
                <span>Anfrage</span>
              </>
            ) : null}
          </span>
          <Link to="/">
            <PublicSiteGlyph />
            Zur Website
          </Link>
        </div>

        <InquiryCountContext.Provider value={countContext}>
          <Outlet />
        </InquiryCountContext.Provider>
      </main>
    </div>
  );
}
