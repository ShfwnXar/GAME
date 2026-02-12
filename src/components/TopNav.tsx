"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getAuth, isAuthed } from "../lib/auth";

type NavItem = { href: string; label: string };

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function maskEmail(email: string) {
  const [u, d] = email.split("@");
  if (!u || !d) return email;
  const head = u.slice(0, 2);
  const tail = u.length > 2 ? u.slice(-1) : "";
  return `${head}${"•".repeat(Math.max(0, u.length - 3))}${tail}@${d}`;
}

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const ok = isAuthed();
    const a = getAuth();
    setAuthed(ok);
    setEmail(a.email || "");
  }, [pathname]);

  const items: NavItem[] = useMemo(
    () => [
      { href: "/registration", label: "Pendaftaran" },
      { href: "/admin", label: "Admin" },
    ],
    []
  );

  const onLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  const hideNav = pathname === "/login";

  if (hideNav) return null;

  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-50 border flex items-center justify-center">
              <img src="/logo-muhammadiyah.png" alt="Logo Muhammadiyah" className="h-6 w-6 object-contain" />
            </div>
            <div className="text-lg font-bold text-[#0C2C4A]">Muhammadiyah Games 2026</div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <img src="/logo-1.png" className="h-8 object-contain" />
            <img src="/logo-2.png" className="h-8 object-contain" />
            <img src="/logo-3.png" className="h-8 object-contain" />
            <img src="/logo-4.png" className="h-8 object-contain" />
            <img src="/logo-5.png" className="h-8 object-contain" />
          </div>

          <div className="flex items-center gap-3">
            {authed ? (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <div className="text-xs text-gray-500">Login sebagai</div>
                  <div className="text-sm font-semibold text-gray-900">{maskEmail(email)}</div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2 rounded-xl bg-[#0C2C4A] text-white hover:opacity-90"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="px-4 py-2 rounded-xl bg-[#0C2C4A] text-white hover:opacity-90">
                Login
              </Link>
            )}
          </div>
        </div>

        <div className="md:hidden flex items-center justify-center gap-4">
          <img src="/logo-1.png" className="h-6 object-contain" />
          <img src="/logo-2.png" className="h-6 object-contain" />
          <img src="/logo-3.png" className="h-6 object-contain" />
          <img src="/logo-4.png" className="h-6 object-contain" />
          <img src="/logo-5.png" className="h-6 object-contain" />
        </div>

        <nav className="flex items-center gap-2">
          {items.map((it) => {
            const active = pathname?.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cx(
                  "px-4 py-2 rounded-xl text-sm border transition",
                  active ? "bg-[#0C2C4A] text-white border-[#0C2C4A]" : "bg-white text-gray-800 hover:bg-gray-50"
                )}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
