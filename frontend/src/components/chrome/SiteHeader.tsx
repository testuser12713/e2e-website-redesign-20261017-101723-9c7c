import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Brand from "../Brand";
import Button from "../Button";
import { cn } from "../../lib/cn";
import "./SiteHeader.css";

const MOBILE_MEDIA_QUERY = "(max-width: 980px)";

function isMobileViewport(): boolean {
  if (typeof window.matchMedia === "function") {
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  }
  return window.innerWidth <= 980;
}

const NAVIGATION = [
  { to: "/", label: "Start" },
  { to: "/equicube", label: "EquiCube" },
  { to: "/ueber-uns", label: "Über uns" },
  { to: "/kontakt", label: "Kontakt" },
  { to: "/impressum", label: "Impressum" },
];

export interface SiteHeaderProps {
  navId?: string;
  navToggleTestId?: string;
}

export default function SiteHeader({
  navId = "site-nav",
  navToggleTestId = "nav-toggle",
}: SiteHeaderProps) {
  const location = useLocation();
  const onContactPage = location.pathname === "/kontakt";
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef(false);

  useEffect(() => {
    const isMobile = isMobileViewport();
    document.body.classList.toggle("menu-open", menuOpen && isMobile);
    if (menuOpen && !isMobile) {
      setMenuOpen(false);
    }
    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen && restoreFocusRef.current) {
      restoreFocusRef.current = false;
      toggleRef.current?.focus();
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const firstLink = navRef.current?.querySelector<HTMLAnchorElement>("a");
    firstLink?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        restoreFocusRef.current = true;
        setMenuOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 980) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  const handleToggle = () => {
    if (!menuOpen && !isMobileViewport()) {
      return;
    }
    setMenuOpen((open) => !open);
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        Zum Inhalt springen
      </a>
      <header className="site-header ec-header">
        <div className="container header-inner">
          <Brand className="site-brand" />

          <nav
            ref={navRef}
            id={navId}
            className={cn("site-nav", menuOpen && "is-open")}
            aria-label="Hauptnavigation"
          >
            {NAVIGATION.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            {onContactPage ? (
              <Button
                href="#contact-form-heading"
                variant="primary"
                size="sm"
                onClick={() => setMenuOpen(false)}
              >
                Zum Formular
              </Button>
            ) : (
              <Button to="/kontakt" variant="primary" size="sm">
                Jetzt anfragen
              </Button>
            )}
          </div>

          <button
            ref={toggleRef}
            className="nav-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls={navId}
            data-testid={navToggleTestId}
            onClick={handleToggle}
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M3 6h14M3 10h14M3 14h14"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <span>{menuOpen ? "Schließen" : "Menü"}</span>
          </button>
        </div>
      </header>
    </>
  );
}
