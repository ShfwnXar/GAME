import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function makeToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export function AuthGate() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const next = sp.get("next") || "/register";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const em = email.trim();
    if (!em) {
      setErr("Email wajib diisi.");
      return;
    }
    if (!password.trim()) {
      setErr("Password wajib diisi.");
      return;
    }
    login({ email: em, token: makeToken() });
    nav(next, { replace: true });
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-white">
      <div className="relative overflow-hidden hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900" />
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
          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <div className="text-xl font-bold text-[#0C2C4A]">Masuk ke Akun</div>
            <div className="text-sm text-gray-600 mt-1">Masukkan kredensial untuk melanjutkan</div>

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-800">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 bg-white" placeholder="email@example.com" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 bg-white" placeholder="••••••••" />
              </div>

              {err ? <div className="text-sm text-red-600">{err}</div> : null}

              <button type="submit" className="w-full px-4 py-2 rounded-xl bg-emerald-600 text-white hover:opacity-90">
                Masuk
              </button>

              <div className="text-xs text-gray-500 text-center">Dengan masuk, Anda menyetujui syarat dan ketentuan Muhammadiyah Games 2026</div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
