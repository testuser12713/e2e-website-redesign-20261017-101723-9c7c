import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-content">
        Zum Inhalt springen
      </a>
      <header className="admin-header">
        <div className="admin-header__inner container">
          <Link to="/" className="admin-header__brand">
            <img
              className="admin-header__mark"
              src="/equicrew-mark.svg"
              alt=""
              width={32}
              height={32}
            />
            <span>EquiCrew Intern</span>
          </Link>
          <Link to="/" className="admin-header__back">
            Zur Website
          </Link>
        </div>
      </header>
      <main id="admin-content" className="admin-main" tabIndex={-1}>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
