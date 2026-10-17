import { Outlet } from "react-router-dom";
import SiteFooter from "../components/chrome/SiteFooter";
import SiteHeader from "../components/chrome/SiteHeader";

export default function Layout() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main id="main-content" className="site-main" tabIndex={-1}>
        <div className="container">
          <Outlet />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
