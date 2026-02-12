"use client";

import React, { useMemo, useState } from "react";
import type { KontingenProfile, NumberEntry, PersonEntry, Step1Data } from "../RegistrationWizard";
import { DocumentUploadCard } from "../DocumentUploadCard";
import { Step3Review } from "./Step3Review";

type PersonDocKey = "ktp_kia" | "kartu_pelajar_mahasiswa" | "raport_khs" | "bpjs" | "pas_foto";
type PersonDocs = Record<PersonDocKey, File | null>;

type Tab = "KONTINGEN" | "ATLET" | "OFFICIAL";
type View = "FORM" | "REVIEW";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "px-4 py-2 rounded-xl text-sm border transition",
        active ? "bg-[#0C2C4A] text-white border-[#0C2C4A]" : "bg-white hover:bg-gray-50 text-gray-800"
      )}
    >
      {label}
    </button>
  );
}

function PersonIndexPicker({
  label,
  count,
  value,
  onChange,
}: {
  label: string;
  count: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-sm font-medium text-gray-800">{label}</div>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))} className="border rounded-xl px-3 py-2 bg-white" disabled={count <= 0}>
        {Array.from({ length: count }).map((_, i) => (
          <option key={i} value={i}>
            #{i + 1}
          </option>
        ))}
      </select>
    </div>
  );
}

function personDataOk(p: PersonEntry | null) {
  if (!p) return false;
  if (!p.nama.trim()) return false;
  if (!p.tempatLahir.trim()) return false;
  if (!p.tanggalLahir.trim()) return false;
  if (!p.jenisKelamin) return false;
  if (!p.sekolah_instansi.trim()) return false;
  if (!p.noWa.trim()) return false;
  if (!p.email.trim()) return false;
  return true;
}

export function Step3Entry({
  step1,
  numbers,
  step2Complete,
  step3Complete,
  fees,
  bankInfo,
  kontingen,
  setKontingen,
  kontingenFiles,
  setKontingenFiles,
  people,
  updatePersonByRoleIndex,
  athleteDocs,
  setAthleteDocs,
  officialDocs,
  setOfficialDocs,
  onBack,
  onSubmit,
}: {
  step1: Step1Data;
  numbers: NumberEntry[];
  step2Complete: boolean;
  step3Complete: boolean;
  fees: null | { peserta: number; official: number; total: number };
  bankInfo: { accountName: string; accountNumber: string };
  kontingen: KontingenProfile;
  setKontingen: React.Dispatch<React.SetStateAction<KontingenProfile>>;
  kontingenFiles: Record<"bukti_dapodik_pd_dikti" | "bukti_pembayaran", File | null>;
  setKontingenFiles: React.Dispatch<React.SetStateAction<Record<"bukti_dapodik_pd_dikti" | "bukti_pembayaran", File | null>>>;
  people: PersonEntry[];
  updatePersonByRoleIndex: (role: "ATLET" | "OFFICIAL", roleIndex: number, patch: Partial<PersonEntry>) => void;
  athleteDocs: PersonDocs[];
  setAthleteDocs: React.Dispatch<React.SetStateAction<PersonDocs[]>>;
  officialDocs: PersonDocs[];
  setOfficialDocs: React.Dispatch<React.SetStateAction<PersonDocs[]>>;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [tab, setTab] = useState<Tab>("KONTINGEN");
  const [view, setView] = useState<View>("FORM");
  const [athleteIndex, setAthleteIndex] = useState(0);
  const [officialIndex, setOfficialIndex] = useState(0);

  const atlet = useMemo(() => people.filter((p) => p.role === "ATLET"), [people]);
  const official = useMemo(() => people.filter((p) => p.role === "OFFICIAL"), [people]);

  const atletSelected = atlet[athleteIndex] || null;
  const officialSelected = official[officialIndex] || null;

  const atletDoc = athleteDocs[athleteIndex] || null;
  const officialDoc = officialDocs[officialIndex] || null;

  const kontingenOk = useMemo(() => {
    const profileOk =
      kontingen.namaPendaftar.trim() &&
      kontingen.sekolahInstansi.trim() &&
      kontingen.alamat.trim() &&
      kontingen.noWa.trim() &&
      kontingen.email.trim();
    const docOk = Boolean(kontingenFiles.bukti_dapodik_pd_dikti) && Boolean(kontingenFiles.bukti_pembayaran);
    return Boolean(profileOk && docOk);
  }, [kontingen, kontingenFiles]);

  const athleteRows = useMemo(() => {
    const rows: Array<{
      index: number;
      person: PersonEntry | null;
      dataOk: boolean;
      docsOk: boolean;
      complete: boolean;
      docs: PersonDocs | null;
    }> = [];
    for (let i = 0; i < step1.jumlahAtlet; i++) {
      const person = atlet[i] || null;
      const dataOk = personDataOk(person);
      const docs = athleteDocs[i] || null;
      const docsOk = Boolean(docs?.ktp_kia) && Boolean(docs?.kartu_pelajar_mahasiswa) && Boolean(docs?.raport_khs) && Boolean(docs?.bpjs) && Boolean(docs?.pas_foto);
      rows.push({ index: i, person, dataOk, docsOk, complete: dataOk && docsOk, docs });
    }
    return rows;
  }, [step1.jumlahAtlet, atlet, athleteDocs]);

  const officialRows = useMemo(() => {
    const rows: Array<{
      index: number;
      person: PersonEntry | null;
      dataOk: boolean;
      docsOk: boolean;
      complete: boolean;
      docs: PersonDocs | null;
    }> = [];
    for (let i = 0; i < step1.jumlahOfficial; i++) {
      const person = official[i] || null;
      const dataOk = personDataOk(person);
      const docs = officialDocs[i] || null;
      const docsOk = Boolean(docs?.ktp_kia) && Boolean(docs?.kartu_pelajar_mahasiswa) && Boolean(docs?.bpjs) && Boolean(docs?.pas_foto);
      rows.push({ index: i, person, dataOk, docsOk, complete: dataOk && docsOk, docs });
    }
    return rows;
  }, [step1.jumlahOfficial, official, officialDocs]);

  const openKontingen = () => {
    setView("FORM");
    setTab("KONTINGEN");
  };

  const openAthlete = (i: number) => {
    setView("FORM");
    setTab("ATLET");
    setAthleteIndex(Math.max(0, Math.min(i, Math.max(0, step1.jumlahAtlet - 1))));
  };

  const openOfficial = (i: number) => {
    setView("FORM");
    setTab("OFFICIAL");
    setOfficialIndex(Math.max(0, Math.min(i, Math.max(0, step1.jumlahOfficial - 1))));
  };

  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="text-lg font-semibold text-gray-900">Step 3 — Kontingen & Peserta + Dokumen</div>
      <div className="text-sm text-gray-600 mt-1">Isi data diri peserta, upload dokumen per orang (maks 2 MB per dokumen), lalu cek rekap sebelum submit.</div>

      <div className="mt-5 border rounded-2xl p-4 bg-gray-50">
        <div className="font-semibold text-gray-900">Instruksi Pembayaran</div>
        <div className="text-sm text-gray-700 mt-2 space-y-1">
          <div>
            Transfer ke rekening: <span className="font-semibold">{bankInfo.accountNumber}</span>
          </div>
          <div>
            A/n <span className="font-semibold">{bankInfo.accountName}</span>
          </div>
          {fees ? (
            <div className="mt-2">
              Total yang harus dibayarkan: <span className="font-bold">Rp {fees.total.toLocaleString("id-ID")}</span>
            </div>
          ) : null}
        </div>
      </div>

      {view === "REVIEW" ? (
        <Step3Review
          step1={step1}
          numbers={numbers}
          fees={fees}
          bankInfo={bankInfo}
          kontingen={kontingen}
          kontingenFiles={kontingenFiles}
          kontingenOk={kontingenOk}
          athleteRows={athleteRows}
          officialRows={officialRows}
          onBackToForm={() => setView("FORM")}
          onFixKontingen={openKontingen}
          onFixAthlete={openAthlete}
          onFixOfficial={openOfficial}
          onSubmit={onSubmit}
        />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <TabButton active={tab === "KONTINGEN"} label="Kontingen" onClick={() => setTab("KONTINGEN")} />
            <TabButton active={tab === "ATLET"} label={`Atlet (${step1.jumlahAtlet})`} onClick={() => setTab("ATLET")} />
            <TabButton active={tab === "OFFICIAL"} label={`Official (${step1.jumlahOfficial})`} onClick={() => setTab("OFFICIAL")} />
          </div>

          {tab === "KONTINGEN" && (
            <div className="mt-5 border rounded-2xl p-4 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">Data Kontingen</div>
                  <div className="text-sm text-gray-600 mt-1">Data pendaftar/kontak sekolah/instansi + dokumen kontingen.</div>
                </div>
                <img src="/logo-muhammadiyah.png" className="h-8 w-8 object-contain" />
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-800">Nama Pendaftar</label>
                  <input value={kontingen.namaPendaftar} onChange={(e) => setKontingen((p) => ({ ...p, namaPendaftar: e.target.value }))} className="mt-1 w-full border rounded-xl px-3 py-2" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">Sekolah/Instansi</label>
                  <input value={kontingen.sekolahInstansi} onChange={(e) => setKontingen((p) => ({ ...p, sekolahInstansi: e.target.value }))} className="mt-1 w-full border rounded-xl px-3 py-2" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-800">Alamat</label>
                  <input value={kontingen.alamat} onChange={(e) => setKontingen((p) => ({ ...p, alamat: e.target.value }))} className="mt-1 w-full border rounded-xl px-3 py-2" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">No. WhatsApp</label>
                  <input value={kontingen.noWa} onChange={(e) => setKontingen((p) => ({ ...p, noWa: e.target.value }))} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="08xxxxxxxxxx" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">Email</label>
                  <input value={kontingen.email} onChange={(e) => setKontingen((p) => ({ ...p, email: e.target.value }))} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="nama@email.com" />
                </div>
              </div>

              <div className="mt-6">
                <div className="font-semibold text-gray-900">Dokumen Kontingen</div>
                <div className="text-sm text-gray-600 mt-1">Wajib upload PD-DIKTI/Dapodik dan bukti pembayaran.</div>

                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <DocumentUploadCard
                    documentName="bukti_dapodik_pd_dikti"
                    documentLabel="Bukti terdaftar di Dapodik / PD-DIKTI"
                    required
                    file={kontingenFiles.bukti_dapodik_pd_dikti}
                    uploaded={Boolean(kontingenFiles.bukti_dapodik_pd_dikti)}
                    onUpload={(f) => setKontingenFiles((p) => ({ ...p, bukti_dapodik_pd_dikti: f }))}
                    onRemove={() => setKontingenFiles((p) => ({ ...p, bukti_dapodik_pd_dikti: null }))}
                  />

                  <DocumentUploadCard
                    documentName="bukti_pembayaran"
                    documentLabel="Bukti Pembayaran"
                    required
                    file={kontingenFiles.bukti_pembayaran}
                    uploaded={Boolean(kontingenFiles.bukti_pembayaran)}
                    onUpload={(f) => setKontingenFiles((p) => ({ ...p, bukti_pembayaran: f }))}
                    onRemove={() => setKontingenFiles((p) => ({ ...p, bukti_pembayaran: null }))}
                  />
                </div>

                {!kontingenOk ? <div className="mt-4 text-sm text-red-600">Lengkapi data kontingen dan dokumen kontingen.</div> : null}
              </div>
            </div>
          )}

          {tab === "ATLET" && (
            <div className="mt-5 border rounded-2xl p-4 bg-white">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold text-gray-900">Data & Dokumen Atlet</div>
                  <div className="text-sm text-gray-600 mt-1">Pilih atlet, isi data diri, lalu upload dokumen atlet.</div>
                </div>
                <PersonIndexPicker label="Pilih Atlet" count={step1.jumlahAtlet} value={athleteIndex} onChange={setAthleteIndex} />
              </div>

              {step1.jumlahAtlet === 0 || !atletSelected || !atletDoc ? (
                <div className="mt-4 text-sm text-gray-600 bg-gray-50 border rounded-xl p-3">Tidak ada atlet.</div>
              ) : (
                <div className="mt-5 grid lg:grid-cols-2 gap-6">
                  <div className="border rounded-2xl p-4 bg-gray-50">
                    <div className="font-semibold text-gray-900">Data Diri Atlet #{athleteIndex + 1}</div>

                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-800">Nama</label>
                        <input value={atletSelected.nama} onChange={(e) => updatePersonByRoleIndex("ATLET", athleteIndex, { nama: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">Jenis Kelamin</label>
                        <select value={atletSelected.jenisKelamin} onChange={(e) => updatePersonByRoleIndex("ATLET", athleteIndex, { jenisKelamin: e.target.value as any })} className="mt-1 w-full border rounded-xl px-3 py-2 bg-white">
                          <option value="">— Pilih —</option>
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">Tempat Lahir</label>
                        <input value={atletSelected.tempatLahir} onChange={(e) => updatePersonByRoleIndex("ATLET", athleteIndex, { tempatLahir: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">Tanggal Lahir</label>
                        <input type="date" value={atletSelected.tanggalLahir} onChange={(e) => updatePersonByRoleIndex("ATLET", athleteIndex, { tanggalLahir: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">NIK (jika ada)</label>
                        <input value={atletSelected.nik} onChange={(e) => updatePersonByRoleIndex("ATLET", athleteIndex, { nik: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="16 digit" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">Sekolah/Instansi</label>
                        <input value={atletSelected.sekolah_instansi} onChange={(e) => updatePersonByRoleIndex("ATLET", athleteIndex, { sekolah_instansi: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">No. WhatsApp</label>
                        <input value={atletSelected.noWa} onChange={(e) => updatePersonByRoleIndex("ATLET", athleteIndex, { noWa: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="08xxxxxxxxxx" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">Email</label>
                        <input value={atletSelected.email} onChange={(e) => updatePersonByRoleIndex("ATLET", athleteIndex, { email: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="nama@email.com" />
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-2xl p-4 bg-gray-50">
                    <div className="font-semibold text-gray-900">Dokumen Atlet #{athleteIndex + 1}</div>
                    <div className="text-sm text-gray-600 mt-1">Wajib: KTP/KIA, Kartu, Raport/KHS, BPJS, Pas Foto.</div>

                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      <DocumentUploadCard
                        documentName={`atlet_${athleteIndex}_ktp_kia`}
                        documentLabel="KTP / KIA (anak < 17)"
                        required
                        file={atletDoc.ktp_kia}
                        uploaded={Boolean(atletDoc.ktp_kia)}
                        onUpload={(f) => setAthleteDocs((prev) => prev.map((d, i) => (i === athleteIndex ? { ...d, ktp_kia: f } : d)))}
                        onRemove={() => setAthleteDocs((prev) => prev.map((d, i) => (i === athleteIndex ? { ...d, ktp_kia: null } : d)))}
                      />

                      <DocumentUploadCard
                        documentName={`atlet_${athleteIndex}_kartu`}
                        documentLabel="Kartu Pelajar Muhammadiyah / KTM"
                        required
                        file={atletDoc.kartu_pelajar_mahasiswa}
                        uploaded={Boolean(atletDoc.kartu_pelajar_mahasiswa)}
                        onUpload={(f) => setAthleteDocs((prev) => prev.map((d, i) => (i === athleteIndex ? { ...d, kartu_pelajar_mahasiswa: f } : d)))}
                        onRemove={() => setAthleteDocs((prev) => prev.map((d, i) => (i === athleteIndex ? { ...d, kartu_pelajar_mahasiswa: null } : d)))}
                      />

                      <DocumentUploadCard
                        documentName={`atlet_${athleteIndex}_raport`}
                        documentLabel="Raport / KHS Terakhir"
                        required
                        file={atletDoc.raport_khs}
                        uploaded={Boolean(atletDoc.raport_khs)}
                        onUpload={(f) => setAthleteDocs((prev) => prev.map((d, i) => (i === athleteIndex ? { ...d, raport_khs: f } : d)))}
                        onRemove={() => setAthleteDocs((prev) => prev.map((d, i) => (i === athleteIndex ? { ...d, raport_khs: null } : d)))}
                      />

                      <DocumentUploadCard
                        documentName={`atlet_${athleteIndex}_bpjs`}
                        documentLabel="BPJS"
                        required
                        file={atletDoc.bpjs}
                        uploaded={Boolean(atletDoc.bpjs)}
                        onUpload={(f) => setAthleteDocs((prev) => prev.map((d, i) => (i === athleteIndex ? { ...d, bpjs: f } : d)))}
                        onRemove={() => setAthleteDocs((prev) => prev.map((d, i) => (i === athleteIndex ? { ...d, bpjs: null } : d)))}
                      />

                      <DocumentUploadCard
                        documentName={`atlet_${athleteIndex}_pas_foto`}
                        documentLabel="Pas Foto Terbaru"
                        required
                        file={atletDoc.pas_foto}
                        uploaded={Boolean(atletDoc.pas_foto)}
                        onUpload={(f) => setAthleteDocs((prev) => prev.map((d, i) => (i === athleteIndex ? { ...d, pas_foto: f } : d)))}
                        onRemove={() => setAthleteDocs((prev) => prev.map((d, i) => (i === athleteIndex ? { ...d, pas_foto: null } : d)))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "OFFICIAL" && (
            <div className="mt-5 border rounded-2xl p-4 bg-white">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold text-gray-900">Data & Dokumen Official</div>
                  <div className="text-sm text-gray-600 mt-1">Pilih official, isi data diri, lalu upload dokumen official.</div>
                </div>
                <PersonIndexPicker label="Pilih Official" count={step1.jumlahOfficial} value={officialIndex} onChange={setOfficialIndex} />
              </div>

              {step1.jumlahOfficial === 0 || !officialSelected || !officialDoc ? (
                <div className="mt-4 text-sm text-gray-600 bg-gray-50 border rounded-xl p-3">Tidak ada official.</div>
              ) : (
                <div className="mt-5 grid lg:grid-cols-2 gap-6">
                  <div className="border rounded-2xl p-4 bg-gray-50">
                    <div className="font-semibold text-gray-900">Data Diri Official #{officialIndex + 1}</div>

                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-800">Nama</label>
                        <input value={officialSelected.nama} onChange={(e) => updatePersonByRoleIndex("OFFICIAL", officialIndex, { nama: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">Jenis Kelamin</label>
                        <select value={officialSelected.jenisKelamin} onChange={(e) => updatePersonByRoleIndex("OFFICIAL", officialIndex, { jenisKelamin: e.target.value as any })} className="mt-1 w-full border rounded-xl px-3 py-2 bg-white">
                          <option value="">— Pilih —</option>
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">Tempat Lahir</label>
                        <input value={officialSelected.tempatLahir} onChange={(e) => updatePersonByRoleIndex("OFFICIAL", officialIndex, { tempatLahir: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">Tanggal Lahir</label>
                        <input type="date" value={officialSelected.tanggalLahir} onChange={(e) => updatePersonByRoleIndex("OFFICIAL", officialIndex, { tanggalLahir: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">NIK (jika ada)</label>
                        <input value={officialSelected.nik} onChange={(e) => updatePersonByRoleIndex("OFFICIAL", officialIndex, { nik: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="16 digit" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">Sekolah/Instansi</label>
                        <input value={officialSelected.sekolah_instansi} onChange={(e) => updatePersonByRoleIndex("OFFICIAL", officialIndex, { sekolah_instansi: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">No. WhatsApp</label>
                        <input value={officialSelected.noWa} onChange={(e) => updatePersonByRoleIndex("OFFICIAL", officialIndex, { noWa: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="08xxxxxxxxxx" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-800">Email</label>
                        <input value={officialSelected.email} onChange={(e) => updatePersonByRoleIndex("OFFICIAL", officialIndex, { email: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="nama@email.com" />
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-2xl p-4 bg-gray-50">
                    <div className="font-semibold text-gray-900">Dokumen Official #{officialIndex + 1}</div>
                    <div className="text-sm text-gray-600 mt-1">Wajib: KTP, Kartu, BPJS, Pas Foto.</div>

                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      <DocumentUploadCard
                        documentName={`official_${officialIndex}_ktp`}
                        documentLabel="KTP"
                        required
                        file={officialDoc.ktp_kia}
                        uploaded={Boolean(officialDoc.ktp_kia)}
                        onUpload={(f) => setOfficialDocs((prev) => prev.map((d, i) => (i === officialIndex ? { ...d, ktp_kia: f } : d)))}
                        onRemove={() => setOfficialDocs((prev) => prev.map((d, i) => (i === officialIndex ? { ...d, ktp_kia: null } : d)))}
                      />

                      <DocumentUploadCard
                        documentName={`official_${officialIndex}_kartu`}
                        documentLabel="Kartu Tanda (Kartu Pelajar/KTM)"
                        required
                        file={officialDoc.kartu_pelajar_mahasiswa}
                        uploaded={Boolean(officialDoc.kartu_pelajar_mahasiswa)}
                        onUpload={(f) => setOfficialDocs((prev) => prev.map((d, i) => (i === officialIndex ? { ...d, kartu_pelajar_mahasiswa: f } : d)))}
                        onRemove={() => setOfficialDocs((prev) => prev.map((d, i) => (i === officialIndex ? { ...d, kartu_pelajar_mahasiswa: null } : d)))}
                      />

                      <DocumentUploadCard
                        documentName={`official_${officialIndex}_bpjs`}
                        documentLabel="BPJS"
                        required
                        file={officialDoc.bpjs}
                        uploaded={Boolean(officialDoc.bpjs)}
                        onUpload={(f) => setOfficialDocs((prev) => prev.map((d, i) => (i === officialIndex ? { ...d, bpjs: f } : d)))}
                        onRemove={() => setOfficialDocs((prev) => prev.map((d, i) => (i === officialIndex ? { ...d, bpjs: null } : d)))}
                      />

                      <DocumentUploadCard
                        documentName={`official_${officialIndex}_pas_foto`}
                        documentLabel="Pas Foto Terbaru"
                        required
                        file={officialDoc.pas_foto}
                        uploaded={Boolean(officialDoc.pas_foto)}
                        onUpload={(f) => setOfficialDocs((prev) => prev.map((d, i) => (i === officialIndex ? { ...d, pas_foto: f } : d)))}
                        onRemove={() => setOfficialDocs((prev) => prev.map((d, i) => (i === officialIndex ? { ...d, pas_foto: null } : d)))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-2">
            <button type="button" onClick={onBack} className="px-4 py-2 rounded-xl bg-white border text-gray-700 hover:bg-gray-50">
              Kembali
            </button>

            <button
              type="button"
              disabled={!step2Complete}
              onClick={() => setView("REVIEW")}
              className={cx(
                "px-4 py-2 rounded-xl text-white",
                step2Complete ? "bg-[#0C2C4A] hover:opacity-90" : "bg-gray-300 cursor-not-allowed"
              )}
            >
              Rekap & Checklist
            </button>
          </div>

          {!step3Complete && step2Complete ? (
            <div className="mt-4 text-sm text-gray-600">Lengkapi dulu data & dokumen, lalu buka “Rekap & Checklist” untuk submit.</div>
          ) : null}
        </>
      )}
    </div>
  );
}
