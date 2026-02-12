import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, hydrated } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!hydrated) return;
    if (!session) nav(`/login?next=${encodeURIComponent(loc.pathname)}`, { replace: true });
  }, [hydrated, session, nav, loc.pathname]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border rounded-2xl px-5 py-4 text-sm text-gray-600">Memuat sesi…</div>
      </div>
    );
  }

  if (!session) return null;

  return <>{children}</>;
}
