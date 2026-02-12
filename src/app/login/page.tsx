"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGate } from "../../components/AuthGate";
import { useAuth } from "../../components/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [authed, setAuthed] = useState<{ email: string; token: string } | null>(null);

  const next = searchParams?.get("next") || "/register";

  if (authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border rounded-2xl shadow-sm p-6 w-full max-w-md">
          <div className="text-xl font-bold text-[#0C2C4A]">Login berhasil</div>
          <div className="text-sm text-gray-600 mt-2">Email: {authed.email}</div>
          <div className="text-sm text-gray-600 mt-1">Token: {authed.token}</div>
          <button
            type="button"
            onClick={() => router.replace(next)}
            className="mt-5 w-full px-4 py-2 rounded-xl bg-[#0C2C4A] text-white hover:opacity-90"
          >
            Lanjut ke Pendaftaran
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-white">
      <div className="relative overflow-hidden hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="relative h-full px-10 py-10 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <img src="/logo-muhammadiyah.png" alt="Logo Muhammadiyah" className="h-6 w-6 object-contain" />
            </div>
            <div className="text-white/90 text-sm font-semibold">Muhammadiyah Games 2026</div>
          </div>

          <div className="mt-10">
            <div className="text-white text-4xl font-extrabold leading-tight">
              Portal Peserta
              <br />
              Muhammadiyah
              <br />
              Games 2026
            </div>
            <div className="mt-4 text-white/85 text-sm max-w-md">Masuk untuk melanjutkan pendaftaran dan upload berkas.</div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="bg-white/10 border border-white/20 rounded-3xl p-8 flex items-center justify-center">
                <img src="/mascot.png" alt="Maskot Muhammadiyah Games" className="w-72 h-72 object-contain drop-shadow-2xl" />
              </div>
              <div className="mt-4 text-center text-white/85 text-sm">Siap bertanding di Muhammadiyah Games 2026?</div>
            </div>
          </div>

          <div className="mt-6 bg-white/10 border border-white/20 rounded-2xl p-4">
            <div className="text-white font-semibold text-sm">Upload persyaratan wajib sebelum validasi panitia</div>
            <div className="text-white/80 text-xs mt-1">Pastikan semua dokumen sudah lengkap dan sesuai format.</div>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center px-4 py-10 bg-gray-50">
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="h-10 w-10 rounded-xl bg-white border flex items-center justify-center">
            <img src="/logo-muhammadiyah.png" alt="Logo Muhammadiyah" className="h-6 w-6 object-contain" />
          </div>
          <div className="text-sm font-semibold text-[#0C2C4A]">Muhammadiyah Games 2026</div>
        </div>

        <div className="w-full max-w-lg">
          <div className="mb-6 lg:hidden text-center">
            <div className="text-2xl font-extrabold text-[#0C2C4A]">Portal Peserta</div>
            <div className="text-sm text-gray-600 mt-1">Masuk untuk melanjutkan pendaftaran dan upload berkas.</div>
            <div className="mt-4 flex justify-center">
              <img src="/mascot.png" alt="Maskot" className="h-28 w-28 object-contain" />
            </div>
          </div>

          <AuthGate
            onAuthed={(data) => {
              login({ email: data.email, token: data.token });
              setAuthed(data);
              router.replace(next);
            }}
          />

          <div className="mt-6 text-center text-xs text-gray-500">Dengan masuk, Anda menyetujui syarat dan ketentuan Muhammadiyah Games 2026</div>
        </div>
      </div>
    </div>
  );
}
