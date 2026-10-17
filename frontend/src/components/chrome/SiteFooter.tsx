import { Link } from "react-router-dom";
import Brand from "../Brand";
import SocialLinks from "../SocialLinks";
import "./SiteFooter.css";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer ec-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Brand tone="dark" />
            <p>
              Smarte Energie und fair verteilte KI. Für Häuser, die mitdenken –
              und für die Chancen der nächsten Generation.
            </p>
            <SocialLinks />
          </div>

          <div>
            <p className="footer-title">Navigation</p>
            <nav className="footer-links" aria-label="Footer-Navigation">
              <Link to="/">Start</Link>
              <Link to="/equicube">EquiCube</Link>
              <Link to="/ueber-uns">Über uns</Link>
            </nav>
          </div>

          <div>
            <p className="footer-title">Service</p>
            <div className="footer-links">
              <Link to="/kontakt">Kontakt</Link>
              <Link to="/impressum">Impressum</Link>
              <Link to="/intern/login">Interner Bereich</Link>
            </div>
          </div>

          <div>
            <p className="footer-title">Kontakt</p>
            <address className="footer-contact">
              <span>
                Marktplatz 14
                <br />
                4310 Mauthausen
                <br />
                Österreich
              </span>
              <a href="tel:+436504593129">+43&nbsp;650&nbsp;4593&nbsp;129</a>
              <a href="mailto:office@equicrew.com">office@equicrew.com</a>
            </address>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} EquiCrew FlexCo · Mauthausen</span>
          <div>
            <Link to="/impressum">Impressum</Link>
            <Link to="/intern/login">Interner Bereich</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
