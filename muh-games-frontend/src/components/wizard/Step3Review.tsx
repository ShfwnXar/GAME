"use client";

import React, { useMemo } from "react";
import type { KontingenProfile, NumberEntry, Step1Data, PersonEntry } from "../RegistrationWizard";

type PersonDocs = {
  ktp_kia: File | null;
  kartu_pelajar_mahasiswa: File | null;
  raport_khs: File | null;
  bpjs: File | null;
  pas_foto: File | null;
};

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function badge(ok: boolean) {
  return cx(
    "text-xs px-2 py-1 rounded-lg border",
    ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
  );
}

function shortName(s: string) {
  const t = s.trim();
  return t ? t : "—";
}

export function Step3Review({
  step1,
  numbers,
  fees,
  bankInfo,
  kontingen,
  kontingenFiles,
  kontingenOk,
  athleteRows,
  officialRows,
  onBackToForm,
  onFixKontingen,
  onFixAthlete,
  onFixOfficial,
  onSubmit,
}: {
  step1: Step1Data;
  numbers: NumberEntry[];
  fees: null | { peserta: number; official: number; total: number };
  bankInfo: { accountName: string; accountNumber: string };
  kontingen: KontingenProfile;
  kontingenFiles: Record<"bukti_dapodik_pd_dikti" | "bukti_pembayaran", File | null>;
  kontingenOk: boolean;
  athleteRows: Array<{
    index: number;
    person: PersonEntry | null;
    dataOk: boolean;
    docsOk: boolean;
    complete: boolean;
    docs: PersonDocs | null;
  }>;
  officialRows: Array<{
    index: number;
    person: PersonEntry | null;
    dataOk: boolean;
    docsOk: boolean;
    complete: boolean;
    docs: PersonDocs | null;
  }>;
  onBackToForm: () => void;
  onFixKontingen: () => void;
  onFixAthlete: (i: number) => void;
  onFixOfficial: (i: number) => void;
  onSubmit: () => void;
}) {
  const step3Complete = useMemo(() => {
    if (!kontingenOk) return false;
    if (athleteRows.some((r) => !r.complete)) return false;
    if (officialRows.some((r) => !r.complete)) return false;
    return true;
  }, [kontingenOk, athleteRows, officialRows]);

  const numbersSummary = useMemo(() => {
    return numbers.map((n) => ({
      nomor: n.nomor,
      atlet: n.jumlahAtlet,
      official: n.jumlahOfficial,
    }));
  }, [numbers]);

  return (
    <div className="mt-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-lg font-semibold text-gray-900">Rekap & Checklist</div>
          <div className="text-sm text-gray-600 mt-1">Periksa kelengkapan, klik “Perbaiki” jika ada yang belum lengkap, lalu submit.</div>
        </div>

        <div className={badge(step3Complete)}>{step3Complete ? "Siap Submit" : "Belum Lengkap"}</div>
      </div>

      <div className="mt-5 grid lg:grid-cols-3 gap-4">
        <div className="border rounded-2xl p-4 bg-white">
          <div className="font-semibold text-gray-900">Ringkasan Pendaftaran</div>
          <div className="text-sm text-gray-700 mt-3 space-y-1">
            <div>
              Cabang: <span className="font-semibold">{step1.sport || "—"}</span>
            </div>
            <div>
              Jenjang/Divisi: <span className="font-semibold">{step1.jenjang || "—"}</span>
            </div>
            {step1.sport === "Panahan" ? (
              <div>
                Divisi Panahan: <span className="font-semibold">{(step1.divisiPanahan as any) || "—"}</span>
              </div>
            ) : null}
            <div>
              Atlet: <span className="font-semibold">{step1.jumlahAtlet}</span>
            </div>
            <div>
              Official: <span className="font-semibold">{step1.jumlahOfficial}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-2xl p-4 bg-white">
          <div className="font-semibold text-gray-900">Biaya & Rekening</div>
          <div className="text-sm text-gray-700 mt-3 space-y-1">
            <div>
              Rekening: <span className="font-semibold">{bankInfo.accountNumber}</span>
            </div>
            <div>
              A/n: <span className="font-semibold">{bankInfo.accountName}</span>
            </div>
            {fees ? (
              <>
                <div className="mt-2">
                  Total: <span className="font-bold">Rp {fees.total.toLocaleString("id-ID")}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Pastikan bukti pembayaran sudah diunggah pada tab Kontingen.</div>
              </>
            ) : (
              <div className="text-xs text-gray-500 mt-2">Biaya belum terbentuk.</div>
            )}
          </div>
        </div>

        <div className="border rounded-2xl p-4 bg-white">
          <div className="font-semibold text-gray-900">Nomor yang Dipilih</div>
          {numbersSummary.length ? (
            <div className="mt-3 space-y-2">
              {numbersSummary.map((n, i) => (
                <div key={i} className="text-sm bg-gray-50 border rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{n.nomor}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Atlet: {n.atlet} • Official: {n.official}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-sm text-gray-600 bg-gray-50 border rounded-xl px-3 py-2">Belum ada nomor dipilih.</div>
          )}
        </div>
      </div>

      <div className="mt-6 border rounded-2xl p-4 bg-white">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="font-semibold text-gray-900">Kontingen</div>
            <div className="text-sm text-gray-600 mt-1">Data pendaftar + dokumen kontingen (PD-DIKTI/Dapodik & bukti bayar).</div>
          </div>
          <div className={badge(kontingenOk)}>{kontingenOk ? "Lengkap" : "Belum Lengkap"}</div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm text-gray-700">
          <div className="bg-gray-50 border rounded-xl p-3">
            <div className="text-xs text-gray-500">Nama Pendaftar</div>
            <div className="font-medium">{shortName(kontingen.namaPendaftar)}</div>
          </div>
          <div className="bg-gray-50 border rounded-xl p-3">
            <div className="text-xs text-gray-500">Sekolah/Instansi</div>
            <div className="font-medium">{shortName(kontingen.sekolahInstansi)}</div>
          </div>
          <div className="bg-gray-50 border rounded-xl p-3">
            <div className="text-xs text-gray-500">No WA</div>
            <div className="font-medium">{shortName(kontingen.noWa)}</div>
          </div>
          <div className="bg-gray-50 border rounded-xl p-3">
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-medium">{shortName(kontingen.email)}</div>
          </div>
          <div className="md:col-span-2 bg-gray-50 border rounded-xl p-3">
            <div className="text-xs text-gray-500">Alamat</div>
            <div className="font-medium">{shortName(kontingen.alamat)}</div>
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 border rounded-xl p-3">
            <div className="text-xs text-gray-500">Bukti Dapodik/PD-DIKTI</div>
            <div className="font-medium text-gray-800">{kontingenFiles.bukti_dapodik_pd_dikti?.name || "—"}</div>
          </div>
          <div className="bg-gray-50 border rounded-xl p-3">
            <div className="text-xs text-gray-500">Bukti Pembayaran</div>
            <div className="font-medium text-gray-800">{kontingenFiles.bukti_pembayaran?.name || "—"}</div>
          </div>
        </div>

        {!kontingenOk ? (
          <div className="mt-4">
            <button type="button" onClick={onFixKontingen} className="px-4 py-2 rounded-xl bg-[#0C2C4A] text-white text-sm hover:opacity-90">
              Perbaiki Kontingen
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <div className="border rounded-2xl p-4 bg-white">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="font-semibold text-gray-900">Atlet</div>
              <div className="text-sm text-gray-600 mt-1">Lengkapi data diri + dokumen atlet (5 dokumen).</div>
            </div>
            <div className={badge(athleteRows.every((r) => r.complete))}>{athleteRows.every((r) => r.complete) ? "Lengkap" : "Ada yang belum"}</div>
          </div>

          <div className="mt-4 space-y-2">
            {athleteRows.length ? (
              athleteRows.map((r) => (
                <div key={r.index} className="bg-gray-50 border rounded-xl px-3 py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      Atlet #{r.index + 1} • {shortName(r.person?.nama || "")}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Data: {r.dataOk ? "OK" : "Belum"} • Dokumen: {r.docsOk ? "OK" : "Belum"}
                    </div>
                  </div>
                  {!r.complete ? (
                    <button type="button" onClick={() => onFixAthlete(r.index)} className="shrink-0 px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-xs">
                      Perbaiki
                    </button>
                  ) : (
                    <div className="shrink-0 text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">OK</div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600 bg-gray-50 border rounded-xl px-3 py-2">Tidak ada atlet.</div>
            )}
          </div>
        </div>

        <div className="border rounded-2xl p-4 bg-white">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="font-semibold text-gray-900">Official</div>
              <div className="text-sm text-gray-600 mt-1">Lengkapi data diri + dokumen official (4 dokumen).</div>
            </div>
            <div className={badge(officialRows.every((r) => r.complete))}>{officialRows.every((r) => r.complete) ? "Lengkap" : "Ada yang belum"}</div>
          </div>

          <div className="mt-4 space-y-2">
            {officialRows.length ? (
              officialRows.map((r) => (
                <div key={r.index} className="bg-gray-50 border rounded-xl px-3 py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      Official #{r.index + 1} • {shortName(r.person?.nama || "")}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Data: {r.dataOk ? "OK" : "Belum"} • Dokumen: {r.docsOk ? "OK" : "Belum"}
                    </div>
                  </div>
                  {!r.complete ? (
                    <button type="button" onClick={() => onFixOfficial(r.index)} className="shrink-0 px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-xs">
                      Perbaiki
                    </button>
                  ) : (
                    <div className="shrink-0 text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">OK</div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600 bg-gray-50 border rounded-xl px-3 py-2">Tidak ada official.</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2 flex-wrap">
        <button type="button" onClick={onBackToForm} className="px-4 py-2 rounded-xl bg-white border text-gray-700 hover:bg-gray-50">
          Kembali ke Form
        </button>

        <button
          type="button"
          disabled={!step3Complete}
          onClick={onSubmit}
          className={cx(
            "px-4 py-2 rounded-xl text-white",
            step3Complete ? "bg-[#0C2C4A] hover:opacity-90" : "bg-gray-300 cursor-not-allowed"
          )}
        >
          Submit Pendaftaran
        </button>
      </div>

      {!step3Complete ? <div className="mt-3 text-sm text-gray-600">Masih ada yang belum lengkap. Klik “Perbaiki” untuk langsung menuju bagian yang perlu diisi.</div> : null}
    </div>
  );
}
