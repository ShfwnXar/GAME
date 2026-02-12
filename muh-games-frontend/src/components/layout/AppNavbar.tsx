import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function NavItem({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "px-3 py-2 rounded-xl text-sm border transition",
        active ? "bg-[#0C2C4A] text-white border-[#0C2C4A]" : "bg-white hover:bg-gray-50 text-gray-800"
      )}
    >
      {label}
    </button>
  );
}

export function AppNavbar({ logoSlots = 5, extraLogos = [] }: { logoSlots?: number; extraLogos?: Array<{ src: string; alt: string }> }) {
  const nav = useNavigate();
  const loc = useLocation();
  const { session, logout } = useAuth();

  const items = [
    { label: "Pendaftaran", path: "/register" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Admin", path: "/admin" },
  ];

  return (
    <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white border flex items-center justify-center">
            <img src="/logo-muhammadiyah.png" alt="Logo Muhammadiyah" className="h-6 w-6 object-contain" />
          </div>

          <div className="hidden sm:block">
            <div className="text-sm font-extrabold text-[#0C2C4A] leading-tight">Muhammadiyah Games 2026</div>
            <div className="text-xs text-gray-500">Portal Peserta</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {items.map((it) => (
            <NavItem key={it.path} active={loc.pathname === it.path} label={it.label} onClick={() => nav(it.path)} />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2">
            {Array.from({ length: Math.max(0, logoSlots - 1) }).map((_, i) => {
              const custom = extraLogos[i];
              if (custom) {
                return (
                  <div key={i} className="h-9 w-9 rounded-xl bg-white border flex items-center justify-center overflow-hidden">
                    <img src={custom.src} alt={custom.alt} className="h-7 w-7 object-contain" />
                  </div>
                );
              }
              return (
                <div key={i} className="h-9 w-9 rounded-xl bg-gray-50 border flex items-center justify-center text-[10px] text-gray-400">
                  LOGO
                </div>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border">
            <div className="text-xs text-gray-600">Login:</div>
            <div className="text-xs font-semibold text-gray-800">{session?.email || "-"}</div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              nav("/login", { replace: true });
            }}
            className="px-3 py-2 rounded-xl bg-white border text-sm hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="md:hidden border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2">
          {items.map((it) => (
            <NavItem key={it.path} active={loc.pathname === it.path} label={it.label} onClick={() => nav(it.path)} />
          ))}
        </div>
      </div>
    </div>
  );
}
