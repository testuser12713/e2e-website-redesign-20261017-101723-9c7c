import { Link } from "react-router-dom";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner container">
        <div>
          <p className="site-footer__brand">EquiCrew</p>
          <p className="site-footer__tagline">
            smarte energie · fair verteilte KI
          </p>
        </div>
        <div>
          <h2 className="site-footer__heading">Kontakt</h2>
          <address>
            Marktplatz 14
            <br />
            4310 Mauthausen
            <br />
            <a href="tel:+436504593129">+43 650 4593 129</a>
            <br />
            <a href="mailto:office@equicrew.com">office@equicrew.com</a>
          </address>
        </div>
        <nav aria-label="Footer-Navigation">
          <h2 className="site-footer__heading">Seiten</h2>
          <ul className="site-footer__list">
            <li>
              <Link to="/equicube">EquiCube</Link>
            </li>
            <li>
              <Link to="/ueber-uns">Über uns</Link>
            </li>
            <li>
              <Link to="/kontakt">Kontakt</Link>
            </li>
            <li>
              <Link to="/impressum">Impressum</Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="site-footer__copyright container">
        © {year} EquiCrew FlexCo
      </p>
    </footer>
  );
}
