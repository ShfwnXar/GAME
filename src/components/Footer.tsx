import React from "react";
import { BANK_INFO } from "../lib/constants";

export function Footer() {
  return (
    <footer className="mt-10 border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        <div>
          <div className="font-semibold text-[#0C2C4A]">Muhammadiyah Games 2026</div>
          <p className="text-sm text-gray-600 mt-2">
            Sistem pendaftaran peserta & official untuk cabang olahraga Muhammadiyah Games 2026.
          </p>
        </div>

        <div>
          <div className="font-semibold text-[#0C2C4A]">Bantuan</div>
          <ul className="text-sm text-gray-600 mt-2 space-y-1">
            <li>• Pastikan data & dokumen valid</li>
            <li>• Upload bukti pembayaran setelah transfer</li>
            <li>• Pantau status: Diterima / Revisi / Ditolak</li>
          </ul>
        </div>

        <div>
          <div className="font-semibold text-[#0C2C4A]">Informasi Pembayaran</div>
          <p className="text-sm text-gray-600 mt-2">
            {BANK_INFO.bankLabel}: <span className="font-medium">{BANK_INFO.accountNumber}</span>
            <br />
            A/n <span className="font-medium">{BANK_INFO.accountName}</span>
          </p>
        </div>
      </div>

      <div className="bg-gray-50 text-xs text-gray-500 py-3">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Muhammadiyah Games</span>
          <span>Portal Pendaftaran</span>
        </div>
      </div>
    </footer>
  );
}
