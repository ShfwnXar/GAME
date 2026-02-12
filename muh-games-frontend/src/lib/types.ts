import type { DocumentKey, SportName } from "./constants";

export type RegistrationStage = 1 | 2 | 3;

export type EntryBySport = {
  sport: SportName;
  jenjang?: "SD" | "SMP/MTs" | "SMA/SMK/MA" | "Mahasiswa" | "Umum";
  kategori?: string; // misal: Tapak Suci - Tanding / Seni, dll
  jumlahAtlet: number;
  jumlahOfficial: number;
};

export type EntryByNumberItem = {
  nomor: string; // contoh: "100 meter", "Ganda Putra", kelas berat, dsb
  jumlahAtlet: number;
  jumlahOfficial: number;
};

export type PersonEntry = {
  role: "ATLET" | "OFFICIAL";
  nama: string;
  nik?: string;
  nisn_nim?: string;
  sekolah_instansi: string;
  noWa: string;
  email: string;
};

export type UploadDoc = {
  key: DocumentKey;
  fileName?: string;
  fileUrl?: string; // dari backend
  status?: "PENDING" | "DITERIMA" | "REVISI" | "DITOLAK";
  catatan?: string; // catatan admin
};

export type PaymentInfo = {
  metode: "TRANSFER";
  totalTagihan: number;
  buktiPembayaranDocKey: "bukti_pembayaran";
};

export type RegistrationDraft = {
  stage: RegistrationStage;

  // login profile sekolah/official pendaftar
  pendaftar: {
    nama: string;
    alamat: string;
    instansi: string;
    noWa: string;
    email: string;
  };

  entryBySport?: EntryBySport;
  entryByNumber?: EntryByNumberItem[];
  entryByName?: PersonEntry[];

  documents: UploadDoc[];
  payment?: PaymentInfo;

  statusAkhir?: "DRAFT" | "SUBMITTED" | "DITERIMA" | "REVISI" | "DITOLAK";
};
