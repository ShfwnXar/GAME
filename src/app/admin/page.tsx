"use client";

import React, { useMemo, useState } from "react";
import { RequireAuth } from "../../components/RequireAuth";
import type { RegistrationRecord, RegistrationStatus, Timeline, WinnerEntry } from "../../lib/adminTypes";
import { defaultTimeline, makeMockRegistrations, makeMockWinners } from "../../lib/adminMock";
import { jsPDF } from "jspdf";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function formatMoney(v: number) {
  return `Rp ${v.toLocaleString("id-ID")}`;
}

function formatDateTimeLocal(iso: string) {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

function statusBadge(s: RegistrationStatus) {
  const base = "px-3 py-1 rounded-full text-xs font-semibold border";
  if (s === "DITERIMA") return <span className={cx(base, "bg-green-50 text-green-700 border-green-200")}>Diterima</span>;
  if (s === "REVISI") return <span className={cx(base, "bg-amber-50 text-amber-700 border-amber-200")}>Revisi</span>;
  if (s === "DITOLAK") return <span className={cx(base, "bg-red-50 text-red-700 border-red-200")}>Ditolak</span>;
  return <span className={cx(base, "bg-gray-50 text-gray-700 border-gray-200")}>Diajukan</span>;
}

function toAbsensiPdf(records: RegistrationRecord[]) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  const title = "Absensi Peserta Muhammadiyah Games 2026";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, margin, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Dicetak: ${formatDateTimeLocal(new Date().toISOString())}`, margin, 70);

  let y = 100;
  const rowH = 18;

  const header = ["No", "Reg ID", "Sekolah/Instansi", "Cabang", "Jenjang", "Atlet", "Official", "Status", "Tanda Tangan"];
  const colW = [24, 70, 150, 80, 60, 40, 55, 60, 100];

  const drawRow = (cells: string[], bold: boolean) => {
    let x = margin;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    for (let i = 0; i < cells.length; i++) {
      doc.rect(x, y - rowH + 4, colW[i], rowH);
      doc.text(cells[i], x + 4, y);
      x += colW[i];
    }
    y += rowH;
  };

  drawRow(header, true);

  doc.setFont("helvetica", "normal");
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const cells = [
      String(i + 1),
      r.id,
      r.sekolahInstansi,
      r.sport,
      r.jenjang,
      String(r.jumlahAtlet),
      String(r.jumlahOfficial),
      r.status,
      "",
    ];

    if (y > 760) {
      doc.addPage();
      y = 60;
      drawRow(header, true);
    }

    drawRow(cells, false);
  }

  const filename = `absensi-mg-2026-${Date.now()}.pdf`;
  doc.save(filename);
}

export default function AdminPage() {
  const [timeline, setTimeline] = useState<Timeline>(defaultTimeline);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>(makeMockRegistrations());
  const [winners, setWinners] = useState<WinnerEntry[]>(makeMockWinners());

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<RegistrationStatus | "ALL">("ALL");
  const [selectedId, setSelectedId] = useState<string>("");

  const [actionStatus, setActionStatus] = useState<RegistrationStatus>("DITERIMA");
  const [actionNote, setActionNote] = useState<string>("");

  const [winnerSport, setWinnerSport] = useState<WinnerEntry["sport"]>("Atletik");
  const [winnerJenjang, setWinnerJenjang] = useState<WinnerEntry["jenjang"]>("SMA");
  const [winnerKategori, setWinnerKategori] = useState<string>("");
  const [winnerJuara, setWinnerJuara] = useState<WinnerEntry["juara"]>("1");
  const [winnerNama, setWinnerNama] = useState<string>("");
  const [winnerSekolah, setWinnerSekolah] = useState<string>("");
  const [winnerBukti, setWinnerBukti] = useState<string>("");
  const [winnerBerita, setWinnerBerita] = useState<string>("");

  const selected = useMemo(() => registrations.find((r) => r.id === selectedId) || null, [registrations, selectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return registrations.filter((r) => {
      const matchStatus = status === "ALL" ? true : r.status === status;
      const hay = `${r.id} ${r.sekolahInstansi} ${r.sport} ${r.jenjang} ${r.kontakWa} ${r.emailPendaftar}`.toLowerCase();
      const matchQuery = q.length === 0 ? true : hay.includes(q);
      return matchStatus && matchQuery;
    });
  }, [registrations, query, status]);

  const stats = useMemo(() => {
    const base = { DIAJUKAN: 0, DITERIMA: 0, REVISI: 0, DITOLAK: 0 };
    for (const r of registrations) base[r.status]++;
    return base;
  }, [registrations]);

  const waList = useMemo(() => {
    const map = new Map<string, { sekolah: string; wa: string; email: string }>();
    for (const r of registrations) {
      const key = r.sekolahInstansi;
      if (!map.has(key)) map.set(key, { sekolah: r.sekolahInstansi, wa: r.kontakWa, email: r.emailPendaftar });
    }
    return Array.from(map.values()).sort((a, b) => a.sekolah.localeCompare(b.sekolah));
  }, [registrations]);

  const applyDecision = () => {
    if (!selected) return;
    if ((actionStatus === "REVISI" || actionStatus === "DITOLAK") && actionNote.trim().length < 5) return;

    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === selected.id
          ? {
              ...r,
              status: actionStatus,
              note: actionStatus === "DITERIMA" ? "" : actionNote.trim(),
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
    setSelectedId("");
    setActionNote("");
    setActionStatus("DITERIMA");
  };

  const addWinner = () => {
    if (!winnerKategori.trim() || !winnerNama.trim() || !winnerSekolah.trim() || !winnerBukti.trim() || !winnerBerita.trim()) return;
    const now = new Date().toISOString();
    const next: WinnerEntry = {
      id: `WIN-${String(Date.now()).slice(-6)}`,
      sport: winnerSport,
      jenjang: winnerJenjang,
      kategori: winnerKategori.trim(),
      juara: winnerJuara,
      namaPemenang: winnerNama.trim(),
      sekolahInstansi: winnerSekolah.trim(),
      buktiUrl: winnerBukti.trim(),
      beritaAcaraUrl: winnerBerita.trim(),
      createdAt: now,
    };
    setWinners((p) => [next, ...p]);
    setWinnerKategori("");
    setWinnerNama("");
    setWinnerSekolah("");
    setWinnerBukti("");
    setWinnerBerita("");
    setWinnerJuara("1");
  };

  const timelineValid = useMemo(() => {
    if (!timeline.openAt || !timeline.closeAt) return false;
    return new Date(timeline.openAt).getTime() < new Date(timeline.closeAt).getTime();
  }, [timeline]);

  const saveTimeline = () => {
    if (!timelineValid) return;
    setTimeline((p) => ({ ...p }));
  };

  return (
    <RequireAuth>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xl font-bold text-[#0C2C4A]">Dashboard Admin</div>
              <div className="text-sm text-gray-600 mt-1">Validasi pendaftar, atur timeline, export absensi, dan input pemenang.</div>
            </div>
            <button
              type="button"
              onClick={() => toAbsensiPdf(filtered)}
              className="px-4 py-2 rounded-xl bg-[#0C2C4A] text-white hover:opacity-90"
            >
              Export Absensi PDF
            </button>
          </div>

          <div className="mt-5 grid md:grid-cols-4 gap-3">
            <div className="border rounded-2xl p-4 bg-gray-50">
              <div className="text-xs text-gray-500">Diajukan</div>
              <div className="text-2xl font-bold text-gray-900">{stats.DIAJUKAN}</div>
            </div>
            <div className="border rounded-2xl p-4 bg-gray-50">
              <div className="text-xs text-gray-500">Diterima</div>
              <div className="text-2xl font-bold text-gray-900">{stats.DITERIMA}</div>
            </div>
            <div className="border rounded-2xl p-4 bg-gray-50">
              <div className="text-xs text-gray-500">Revisi</div>
              <div className="text-2xl font-bold text-gray-900">{stats.REVISI}</div>
            </div>
            <div className="border rounded-2xl p-4 bg-gray-50">
              <div className="text-xs text-gray-500">Ditolak</div>
              <div className="text-2xl font-bold text-gray-900">{stats.DITOLAK}</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <div className="text-lg font-bold text-[#0C2C4A]">Timeline Pendaftaran</div>
            <div className="text-sm text-gray-600 mt-1">Atur kapan pendaftaran dibuka dan ditutup.</div>

            <div className="mt-4 grid gap-4">
              <div>
                <label className="text-sm font-medium text-gray-800">Dibuka</label>
                <input
                  type="datetime-local"
                  value={timeline.openAt}
                  onChange={(e) => setTimeline((p) => ({ ...p, openAt: e.target.value }))}
                  className="mt-1 w-full border rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-800">Ditutup</label>
                <input
                  type="datetime-local"
                  value={timeline.closeAt}
                  onChange={(e) => setTimeline((p) => ({ ...p, closeAt: e.target.value }))}
                  className="mt-1 w-full border rounded-xl px-3 py-2"
                />
              </div>

              {!timelineValid && <div className="text-sm text-red-600">Waktu buka harus lebih awal dari waktu tutup.</div>}

              <button
                type="button"
                onClick={saveTimeline}
                disabled={!timelineValid}
                className={cx(
                  "px-4 py-2 rounded-xl text-white",
                  timelineValid ? "bg-[#0C2C4A] hover:opacity-90" : "bg-gray-300 cursor-not-allowed"
                )}
              >
                Simpan Timeline
              </button>

              <div className="text-xs text-gray-500">
                Saat backend siap, timeline ini akan jadi acuan tombol pendaftaran aktif/nonaktif.
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-2xl shadow-sm p-6 lg:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-[#0C2C4A]">Daftar Pendaftar</div>
                <div className="text-sm text-gray-600 mt-1">Filter, pilih pendaftar, lalu validasi berkas.</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border rounded-xl px-3 py-2"
                  placeholder="Cari: sekolah, reg id, cabang, WA, email"
                />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="border rounded-xl px-3 py-2 bg-white"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="DIAJUKAN">Diajukan</option>
                  <option value="DITERIMA">Diterima</option>
                  <option value="REVISI">Revisi</option>
                  <option value="DITOLAK">Ditolak</option>
                </select>
              </div>
            </div>

            <div className="mt-4 overflow-auto border rounded-2xl">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-left">
                    <th className="p-3">Reg ID</th>
                    <th className="p-3">Sekolah/Instansi</th>
                    <th className="p-3">Cabang</th>
                    <th className="p-3">Jenjang</th>
                    <th className="p-3">Atlet</th>
                    <th className="p-3">Official</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-semibold text-gray-900">{r.id}</td>
                      <td className="p-3">{r.sekolahInstansi}</td>
                      <td className="p-3">{r.sport}</td>
                      <td className="p-3">{r.jenjang}</td>
                      <td className="p-3">{r.jumlahAtlet}</td>
                      <td className="p-3">{r.jumlahOfficial}</td>
                      <td className="p-3">{statusBadge(r.status)}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(r.id);
                            setActionStatus("DITERIMA");
                            setActionNote(r.note || "");
                          }}
                          className="px-3 py-2 rounded-xl bg-white border hover:bg-gray-50"
                        >
                          Detail & Validasi
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td className="p-6 text-center text-gray-500" colSpan={8}>
                        Tidak ada data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Export Absensi PDF mengambil data sesuai filter yang sedang aktif.
            </div>
          </div>
        </div>

        {selected && (
          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-[#0C2C4A]">Detail Pendaftar</div>
                <div className="text-sm text-gray-600 mt-1">{selected.id} • Update: {formatDateTimeLocal(selected.updatedAt)}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId("")}
                className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>

            <div className="mt-5 grid lg:grid-cols-3 gap-6">
              <div className="border rounded-2xl p-4 bg-gray-50">
                <div className="font-semibold text-gray-900">Identitas</div>
                <div className="text-sm text-gray-700 mt-2 space-y-1">
                  <div><span className="text-gray-500">Sekolah/Instansi:</span> {selected.sekolahInstansi}</div>
                  <div><span className="text-gray-500">Alamat:</span> {selected.alamat}</div>
                  <div><span className="text-gray-500">WA:</span> {selected.kontakWa}</div>
                  <div><span className="text-gray-500">Email:</span> {selected.emailPendaftar}</div>
                </div>
              </div>

              <div className="border rounded-2xl p-4 bg-gray-50">
                <div className="font-semibold text-gray-900">Pendaftaran</div>
                <div className="text-sm text-gray-700 mt-2 space-y-1">
                  <div><span className="text-gray-500">Cabang:</span> {selected.sport}</div>
                  <div><span className="text-gray-500">Jenjang:</span> {selected.jenjang}</div>
                  {selected.sport === "Panahan" && (
                    <div><span className="text-gray-500">Divisi:</span> {selected.divisiPanahan || "-"}</div>
                  )}
                  <div><span className="text-gray-500">Atlet:</span> {selected.jumlahAtlet}</div>
                  <div><span className="text-gray-500">Official:</span> {selected.jumlahOfficial}</div>
                </div>

                <div className="mt-4">
                  <div className="font-semibold text-gray-900">Nomor</div>
                  <div className="mt-2 space-y-2">
                    {selected.numbers.map((n, i) => (
                      <div key={i} className="bg-white border rounded-xl p-3 text-sm">
                        <div className="font-semibold text-gray-900">{n.nomor}</div>
                        <div className="text-gray-700 mt-1">Atlet: {n.jumlahAtlet} • Official: {n.jumlahOfficial}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border rounded-2xl p-4 bg-gray-50">
                <div className="font-semibold text-gray-900">Pembayaran</div>
                <div className="text-sm text-gray-700 mt-2 space-y-1">
                  <div><span className="text-gray-500">Total:</span> {formatMoney(selected.payment.total)}</div>
                  <div><span className="text-gray-500">A/n:</span> {selected.payment.accountName}</div>
                  <div><span className="text-gray-500">Rekening:</span> {selected.payment.accountNumber}</div>
                </div>
                <a
                  href={selected.payment.proofUrl}
                  target="_blank"
                  className="inline-flex mt-4 px-4 py-2 rounded-xl bg-white border hover:bg-gray-50 text-sm"
                >
                  Lihat Bukti Pembayaran
                </a>

                <div className="mt-6">
                  <div className="font-semibold text-gray-900">Validasi</div>
                  <div className="mt-3 grid gap-3">
                    <select
                      value={actionStatus}
                      onChange={(e) => setActionStatus(e.target.value as RegistrationStatus)}
                      className="border rounded-xl px-3 py-2 bg-white"
                    >
                      <option value="DITERIMA">Terima</option>
                      <option value="REVISI">Revisi</option>
                      <option value="DITOLAK">Tolak</option>
                    </select>

                    {(actionStatus === "REVISI" || actionStatus === "DITOLAK") && (
                      <textarea
                        value={actionNote}
                        onChange={(e) => setActionNote(e.target.value)}
                        className="border rounded-xl px-3 py-2 min-h-[90px]"
                        placeholder="Catatan wajib diisi (min 5 karakter)"
                      />
                    )}

                    <button
                      type="button"
                      onClick={applyDecision}
                      disabled={(actionStatus === "REVISI" || actionStatus === "DITOLAK") && actionNote.trim().length < 5}
                      className={cx(
                        "px-4 py-2 rounded-xl text-white",
                        (actionStatus === "REVISI" || actionStatus === "DITOLAK") && actionNote.trim().length < 5
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-[#0C2C4A] hover:opacity-90"
                      )}
                    >
                      Simpan Keputusan
                    </button>

                    {selected.status !== "DIAJUKAN" && (
                      <div className="text-sm">
                        <div className="mt-2">Status saat ini: {statusBadge(selected.status)}</div>
                        {selected.note && <div className="text-sm text-gray-700 mt-2">Catatan: {selected.note}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border rounded-2xl p-4">
              <div className="font-semibold text-gray-900">Dokumen</div>
              <div className="mt-3 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selected.docs.map((d) => (
                  <a
                    key={d.key}
                    href={d.url}
                    target="_blank"
                    className="border rounded-2xl p-4 bg-white hover:bg-gray-50"
                  >
                    <div className="text-sm font-semibold text-gray-900">{d.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{formatDateTimeLocal(d.uploadedAt)}</div>
                    <div className="text-xs text-[#0C2C4A] mt-2">Lihat File</div>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-6 border rounded-2xl p-4">
              <div className="font-semibold text-gray-900">Entry by Name</div>
              <div className="mt-3 overflow-auto border rounded-2xl">
                <table className="min-w-[900px] w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left">
                      <th className="p-3">Role</th>
                      <th className="p-3">Nama</th>
                      <th className="p-3">Sekolah/Instansi</th>
                      <th className="p-3">WA</th>
                      <th className="p-3">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.people.map((p, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3 font-semibold">{p.role}</td>
                        <td className="p-3">{p.nama}</td>
                        <td className="p-3">{p.sekolah_instansi}</td>
                        <td className="p-3">{p.noWa}</td>
                        <td className="p-3">{p.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <div className="text-lg font-bold text-[#0C2C4A]">Input Pemenang</div>
            <div className="text-sm text-gray-600 mt-1">Upload nama pemenang per kategori dan cabang + bukti + berita acara (sementara berupa URL).</div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-800">Cabang</label>
                <select value={winnerSport} onChange={(e) => setWinnerSport(e.target.value as any)} className="mt-1 w-full border rounded-xl px-3 py-2 bg-white">
                  <option value="Pencak Silat (Tapak Suci)">Pencak Silat (Tapak Suci)</option>
                  <option value="Atletik">Atletik</option>
                  <option value="Panahan">Panahan</option>
                  <option value="Bulu Tangkis">Bulu Tangkis</option>
                  <option value="Tenis Meja">Tenis Meja</option>
                  <option value="Voli Indoor">Voli Indoor</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">Jenjang</label>
                <select value={winnerJenjang} onChange={(e) => setWinnerJenjang(e.target.value as any)} className="mt-1 w-full border rounded-xl px-3 py-2 bg-white">
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="MAHASISWA">Mahasiswa</option>
                  <option value="UMUM">Umum</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-800">Kategori</label>
                <input value={winnerKategori} onChange={(e) => setWinnerKategori(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="contoh: 100 meter Putra / Ganda Putri / Kelas 45-50 kg" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">Juara</label>
                <select value={winnerJuara} onChange={(e) => setWinnerJuara(e.target.value as any)} className="mt-1 w-full border rounded-xl px-3 py-2 bg-white">
                  <option value="1">Juara 1</option>
                  <option value="2">Juara 2</option>
                  <option value="3">Juara 3</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">Nama Pemenang</label>
                <input value={winnerNama} onChange={(e) => setWinnerNama(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="Nama" />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-800">Sekolah/Instansi</label>
                <input value={winnerSekolah} onChange={(e) => setWinnerSekolah(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="Sekolah/Instansi" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">URL Bukti Pertandingan</label>
                <input value={winnerBukti} onChange={(e) => setWinnerBukti(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="/files/bukti.pdf" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">URL Berita Acara</label>
                <input value={winnerBerita} onChange={(e) => setWinnerBerita(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="/files/berita-acara.pdf" />
              </div>

              <button
                type="button"
                onClick={addWinner}
                className="md:col-span-2 px-4 py-2 rounded-xl bg-[#0C2C4A] text-white hover:opacity-90"
              >
                Simpan Pemenang
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <div className="text-lg font-bold text-[#0C2C4A]">Daftar Pemenang</div>
            <div className="text-sm text-gray-600 mt-1">Data pemenang yang sudah diinput.</div>

            <div className="mt-4 overflow-auto border rounded-2xl">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-left">
                    <th className="p-3">Juara</th>
                    <th className="p-3">Cabang</th>
                    <th className="p-3">Jenjang</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Nama</th>
                    <th className="p-3">Sekolah/Instansi</th>
                    <th className="p-3">Bukti</th>
                    <th className="p-3">BA</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.map((w) => (
                    <tr key={w.id} className="border-b">
                      <td className="p-3 font-semibold">#{w.juara}</td>
                      <td className="p-3">{w.sport}</td>
                      <td className="p-3">{w.jenjang}</td>
                      <td className="p-3">{w.kategori}</td>
                      <td className="p-3">{w.namaPemenang}</td>
                      <td className="p-3">{w.sekolahInstansi}</td>
                      <td className="p-3"><a href={w.buktiUrl} target="_blank" className="text-[#0C2C4A] underline">File</a></td>
                      <td className="p-3"><a href={w.beritaAcaraUrl} target="_blank" className="text-[#0C2C4A] underline">File</a></td>
                    </tr>
                  ))}
                  {winners.length === 0 && (
                    <tr>
                      <td className="p-6 text-center text-gray-500" colSpan={8}>Belum ada data pemenang.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="text-lg font-bold text-[#0C2C4A]">Kontak WA Sekolah/Instansi</div>
          <div className="text-sm text-gray-600 mt-1">Ringkasan nomor WhatsApp pendaftar per sekolah/instansi.</div>

          <div className="mt-4 overflow-auto border rounded-2xl">
            <table className="min-w-[700px] w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left">
                  <th className="p-3">Sekolah/Instansi</th>
                  <th className="p-3">WhatsApp</th>
                  <th className="p-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {waList.map((x) => (
                  <tr key={x.sekolah} className="border-b">
                    <td className="p-3 font-semibold">{x.sekolah}</td>
                    <td className="p-3">{x.wa}</td>
                    <td className="p-3">{x.email}</td>
                  </tr>
                ))}
                {waList.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan={3}>Belum ada data.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </RequireAuth>
  );
}
