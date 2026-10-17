import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import AdminLayout from "./admin/AdminLayout";
import InboxPage from "./admin/InboxPage";
import InquiryPage from "./admin/InquiryPage";
import LoginPage from "./admin/LoginPage";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import Gallery from "./kit/Gallery";
import Layout from "./layout/Layout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import EquiCube from "./pages/EquiCube";
import Home from "./pages/Home";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/equicube" element={<EquiCube />} />
            <Route path="/ueber-uns" element={<About />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/impressum" element={<Legal />} />
            {import.meta.env.DEV ? (
              <Route path="/kit" element={<Gallery />} />
            ) : null}
            <Route path="*" element={<NotFound />} />
          </Route>

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
      </BrowserRouter>
    </AuthProvider>
  );
}
