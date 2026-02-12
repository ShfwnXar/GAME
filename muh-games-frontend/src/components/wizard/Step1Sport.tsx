"use client";

import React from "react";
import type { SportName } from "../../lib/constants";
import type { Jenjang, PanahanDivisi } from "../../lib/sportEvents";
import type { Step1Data } from "../RegistrationWizard";

export function Step1Sport({
  sports,
  step1,
  setStep1,
  step1Complete,
  onNext,
  onResetStep2,
  clampInt,
  voliUmumLocked,
  fees,
}: {
  sports: SportName[];
  step1: Step1Data;
  setStep1: React.Dispatch<React.SetStateAction<Step1Data>>;
  step1Complete: boolean;
  onNext: () => void;
  onResetStep2: () => void;
  clampInt: (v: number, min: number, max: number) => number;
  voliUmumLocked: boolean;
  fees: null | { peserta: number; official: number; total: number };
}) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="text-lg font-semibold text-gray-900">Step 1 — Entry by Sport</div>
      <div className="text-sm text-gray-600 mt-1">Pilih cabang, jenjang (dan divisi untuk Panahan), lalu masukkan jumlah atlet & official.</div>

      <div className="grid md:grid-cols-4 gap-4 mt-5">
        <div className="md:col-span-1">
          <label className="text-sm font-medium text-gray-800">Cabang Olahraga</label>
          <select
            value={step1.sport}
            onChange={(e) => {
              const sport = e.target.value as SportName | "";
              setStep1((p) => ({
                ...p,
                sport,
                jenjang: "",
                divisiPanahan: "",
              }));
              onResetStep2();
            }}
            className="mt-1 w-full border rounded-xl px-3 py-2 bg-white"
          >
            <option value="">— Pilih Cabang —</option>
            {sports.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-800">Jenjang</label>
          <select
            value={step1.jenjang}
            onChange={(e) => {
              const jenjang = e.target.value as Jenjang | "";
              setStep1((p) => ({ ...p, jenjang, divisiPanahan: "" }));
              onResetStep2();
            }}
            className="mt-1 w-full border rounded-xl px-3 py-2 bg-white"
            disabled={!step1.sport}
          >
            <option value="">— Pilih Jenjang —</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
            <option value="MAHASISWA">Mahasiswa</option>
            <option value="UMUM">Umum</option>
          </select>
        </div>

        {step1.sport === "Panahan" ? (
          <div>
            <label className="text-sm font-medium text-gray-800">Divisi Panahan</label>
            <select
              value={step1.divisiPanahan ?? ""}
              onChange={(e) => {
                const div = e.target.value as PanahanDivisi | "";
                setStep1((p) => ({ ...p, divisiPanahan: div }));
                onResetStep2();
              }}
              className="mt-1 w-full border rounded-xl px-3 py-2 bg-white"
              disabled={!step1.jenjang}
            >
              <option value="">— Pilih Divisi —</option>
              <option value="Standar Nasional">Standar Nasional</option>
              <option value="Barebow">Barebow</option>
              <option value="Recurve">Recurve</option>
              <option value="Compound">Compound</option>
              <option value="Horsebow">Horsebow</option>
            </select>
          </div>
        ) : (
          <div className="hidden md:block" />
        )}

        <div>
          <label className="text-sm font-medium text-gray-800">Jumlah Atlet</label>
          <input
            type="number"
            min={0}
            value={step1.jumlahAtlet}
            onChange={(e) => setStep1((p) => ({ ...p, jumlahAtlet: clampInt(Number(e.target.value), 0, 9999) }))}
            className={["mt-1 w-full border rounded-xl px-3 py-2", voliUmumLocked ? "bg-gray-100 text-gray-700 cursor-not-allowed" : ""].join(" ")}
            disabled={voliUmumLocked}
            placeholder="contoh: 12"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-800">Jumlah Official</label>
          <input
            type="number"
            min={0}
            value={step1.jumlahOfficial}
            onChange={(e) => setStep1((p) => ({ ...p, jumlahOfficial: clampInt(Number(e.target.value), 0, 9999) }))}
            className={["mt-1 w-full border rounded-xl px-3 py-2", voliUmumLocked ? "bg-gray-100 text-gray-700 cursor-not-allowed" : ""].join(" ")}
            disabled={voliUmumLocked}
            placeholder="contoh: 3"
          />
        </div>
      </div>

      {voliUmumLocked && <div className="mt-4 text-sm text-gray-700 bg-gray-50 border rounded-xl p-3">Voli Indoor (Umum) otomatis: 12 atlet + 3 official.</div>}

      <div className="mt-6 border rounded-2xl p-4 bg-gray-50">
        <div className="font-semibold text-gray-900">Ringkasan Biaya (preview)</div>
        {fees ? (
          <div className="mt-2 text-sm text-gray-700 space-y-1">
            <div className="flex justify-between">
              <span>Biaya peserta</span>
              <span className="font-medium">Rp {fees.peserta.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya official</span>
              <span className="font-medium">Rp {fees.official.toLocaleString("id-ID")}</span>
            </div>
            <div className="border-t my-2" />
            <div className="flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">Rp {fees.total.toLocaleString("id-ID")}</span>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-600">Lengkapi data Step 1 untuk melihat biaya.</div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={!step1Complete}
          onClick={onNext}
          className={["px-4 py-2 rounded-xl text-white", step1Complete ? "bg-[#0C2C4A] hover:opacity-90" : "bg-gray-300 cursor-not-allowed"].join(" ")}
        >
          Lanjut ke Step 2
        </button>
      </div>
    </div>
  );
}
