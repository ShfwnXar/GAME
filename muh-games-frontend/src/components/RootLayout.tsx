import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import { storage } from "../lib/storage";
import { LogoBar } from "./LogoBar";
import { Footer } from "./Footer";

// pakai asset/logo Muhammadiyah (sesuaikan path asset kamu)
import muhLogo from "figma:asset/PUT_MUHAMMADIYAH_LOGO.png";

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = storage.getUser();
    if (!user && location.pathname !== "/") navigate("/");
    if (user && location.pathname === "/") navigate("/dashboard");
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LogoBar
        muhammadiyahLogoSrc={muhLogo}
        partnerLogoSrcs={[null, null, null, null, null]} // nanti diambil dari config/admin
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
