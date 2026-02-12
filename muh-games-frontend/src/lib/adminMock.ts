import { BANK_INFO, REQUIRED_DOCUMENTS } from "./constants";
import type { RegistrationRecord, Timeline, WinnerEntry } from "./adminTypes";

export const defaultTimeline: Timeline = {
  openAt: "2026-01-01T08:00",
  closeAt: "2026-03-01T23:59",
};

export function makeMockRegistrations(): RegistrationRecord[] {
  const now = new Date().toISOString();
  return [
    {
      id: "REG-0001",
      createdAt: now,
      updatedAt: now,
      sekolahInstansi: "SMA Muhammadiyah 1",
      kontakWa: "081234567890",
      emailPendaftar: "admin@sma1.sch.id",
      alamat: "Jl. Contoh No. 1, Kota A",
      sport: "Atletik",
      jenjang: "SMA",
      divisiPanahan: "",
      jumlahAtlet: 6,
      jumlahOfficial: 2,
      numbers: [
        { nomor: "100 meter", jumlahAtlet: 2, jumlahOfficial: 0 },
        { nomor: "400 meter", jumlahAtlet: 2, jumlahOfficial: 0 },
        { nomor: "Estafet 4x400 m", jumlahAtlet: 2, jumlahOfficial: 2 },
      ],
      people: [
        { role: "ATLET", nama: "Ahmad", sekolah_instansi: "SMA Muhammadiyah 1", noWa: "08111", email: "a1@mail.com" },
        { role: "ATLET", nama: "Budi", sekolah_instansi: "SMA Muhammadiyah 1", noWa: "08112", email: "a2@mail.com" },
        { role: "ATLET", nama: "Citra", sekolah_instansi: "SMA Muhammadiyah 1", noWa: "08113", email: "a3@mail.com" },
        { role: "ATLET", nama: "Dina", sekolah_instansi: "SMA Muhammadiyah 1", noWa: "08114", email: "a4@mail.com" },
        { role: "ATLET", nama: "Eka", sekolah_instansi: "SMA Muhammadiyah 1", noWa: "08115", email: "a5@mail.com" },
        { role: "ATLET", nama: "Fajar", sekolah_instansi: "SMA Muhammadiyah 1", noWa: "08116", email: "a6@mail.com" },
        { role: "OFFICIAL", nama: "Pelatih 1", sekolah_instansi: "SMA Muhammadiyah 1", noWa: "08221", email: "o1@mail.com" },
        { role: "OFFICIAL", nama: "Official 2", sekolah_instansi: "SMA Muhammadiyah 1", noWa: "08222", email: "o2@mail.com" },
      ],
      payment: {
        total: 700000,
        bankName: "Bank",
        accountName: BANK_INFO.accountName,
        accountNumber: BANK_INFO.accountNumber,
        proofUrl: "/dummy/bukti-bayar.pdf",
      },
      docs: REQUIRED_DOCUMENTS.map((d) => ({
        key: d.key,
        label: d.label,
        url: `/dummy/${d.key}.pdf`,
        uploadedAt: now,
      })),
      status: "DIAJUKAN",
      note: "",
    },
    {
      id: "REG-0002",
      createdAt: now,
      updatedAt: now,
      sekolahInstansi: "Universitas Muhammadiyah X",
      kontakWa: "089900112233",
      emailPendaftar: "bem@umx.ac.id",
      alamat: "Kampus UMX, Kota B",
      sport: "Voli Indoor",
      jenjang: "UMUM",
      divisiPanahan: "",
      jumlahAtlet: 12,
      jumlahOfficial: 3,
      numbers: [{ nomor: "Beregu Putra", jumlahAtlet: 12, jumlahOfficial: 3 }],
      people: Array.from({ length: 12 }).map((_, i) => ({
        role: "ATLET",
        nama: `Atlet ${i + 1}`,
        sekolah_instansi: "Universitas Muhammadiyah X",
        noWa: `0819${i}00`,
        email: `atlet${i + 1}@umx.ac.id`,
      })).concat(
        Array.from({ length: 3 }).map((_, i) => ({
          role: "OFFICIAL",
          nama: `Official ${i + 1}`,
          sekolah_instansi: "Universitas Muhammadiyah X",
          noWa: `0828${i}00`,
          email: `official${i + 1}@umx.ac.id`,
        }))
      ),
      payment: {
        total: 1500000,
        bankName: "Bank",
        accountName: BANK_INFO.accountName,
        accountNumber: BANK_INFO.accountNumber,
        proofUrl: "/dummy/bukti-bayar-voli.pdf",
      },
      docs: REQUIRED_DOCUMENTS.map((d) => ({
        key: d.key,
        label: d.label,
        url: `/dummy/${d.key}-2.pdf`,
        uploadedAt: now,
      })),
      status: "REVISI",
      note: "Mohon perbaiki pas foto terbaru (blur) dan bukti PD-DIKTI belum jelas.",
    },
  ];
}

export function makeMockWinners(): WinnerEntry[] {
  const now = new Date().toISOString();
  return [
    {
      id: "WIN-0001",
      sport: "Atletik",
      jenjang: "SMA",
      kategori: "100 meter Putra",
      juara: "1",
      namaPemenang: "Ahmad",
      sekolahInstansi: "SMA Muhammadiyah 1",
      buktiUrl: "/dummy/bukti-pertandingan.pdf",
      beritaAcaraUrl: "/dummy/berita-acara.pdf",
      createdAt: now,
    },
  ];
}
