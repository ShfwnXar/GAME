"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthed } from "../lib/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ok = isAuthed();
    if (!ok) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    setReady(true);
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white border rounded-2xl shadow-sm p-6 w-full max-w-md text-center">
          <div className="text-lg font-semibold text-[#0C2C4A]">Memuat...</div>
          <div className="text-sm text-gray-600 mt-2">Memeriksa sesi login.</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
