import type { SportName, DocumentKey } from "./constants";
import type { Jenjang, PanahanDivisi } from "./sportEvents";

export type RegistrationStatus = "DIAJUKAN" | "DITERIMA" | "REVISI" | "DITOLAK";

export type UploadedDoc = {
  key: DocumentKey;
  label: string;
  url: string;
  uploadedAt: string;
};

export type Person = {
  role: "ATLET" | "OFFICIAL";
  nama: string;
  sekolah_instansi: string;
  noWa: string;
  email: string;
};

export type NumberEntryAdmin = {
  nomor: string;
  jumlahAtlet: number;
  jumlahOfficial: number;
};

export type Payment = {
  total: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  proofUrl: string;
};

export type RegistrationRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  sekolahInstansi: string;
  kontakWa: string;
  emailPendaftar: string;
  alamat: string;
  sport: SportName;
  jenjang: Jenjang;
  divisiPanahan?: PanahanDivisi | "";
  jumlahAtlet: number;
  jumlahOfficial: number;
  numbers: NumberEntryAdmin[];
  people: Person[];
  payment: Payment;
  docs: UploadedDoc[];
  status: RegistrationStatus;
  note: string;
};

export type Timeline = {
  openAt: string;
  closeAt: string;
};

export type WinnerEntry = {
  id: string;
  sport: SportName;
  jenjang: Jenjang;
  kategori: string;
  juara: "1" | "2" | "3";
  namaPemenang: string;
  sekolahInstansi: string;
  buktiUrl: string;
  beritaAcaraUrl: string;
  createdAt: string;
};
