import { NavLink } from "react-router-dom";

const navigation = [
  { to: "/", label: "Start" },
  { to: "/equicube", label: "EquiCube" },
  { to: "/ueber-uns", label: "Über uns" },
  { to: "/kontakt", label: "Kontakt" },
  { to: "/impressum", label: "Impressum" },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Zum Inhalt springen
      </a>
      <div className="site-header__inner container">
        <NavLink
          to="/"
          className="site-brand"
          aria-label="EquiCrew – zur Startseite"
        >
          <img
            className="site-brand__mark"
            src="/equicrew-mark.svg"
            alt=""
            width={36}
            height={36}
          />
          <span className="site-brand__wordmark">EquiCrew</span>
        </NavLink>
        <nav className="site-nav" aria-label="Hauptnavigation">
          <ul className="site-nav__list">
            {navigation.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === "/"} className="site-nav__link">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
