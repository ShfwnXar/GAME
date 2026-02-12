"use client";

import React from "react";
import { RequireAuth } from "../../components/auth/RequireAuth";
import { AppNavbar } from "../../components/layout/AppNavbar";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <AppNavbar logoSlots={5} extraLogos={[]} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="text-xl font-bold text-[#0C2C4A]">Dashboard Peserta</div>
            <div className="text-sm text-gray-600 mt-2">
              Ini placeholder. Nanti isinya bisa: status berkas (diterima/revisi/ditolak), ringkasan biaya, tombol download bukti, dll.
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
