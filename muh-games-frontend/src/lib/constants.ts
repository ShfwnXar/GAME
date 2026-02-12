export const SPORTS = [
  "Pencak Silat (Tapak Suci)",
  "Atletik",
  "Panahan",
  "Bulu Tangkis",
  "Tenis Meja",
  "Voli Indoor",
] as const;

export type SportName = typeof SPORTS[number];

export const REQUIRED_DOCUMENTS = [
  { key: "dapodik_pd_dikti", label: "Bukti terdaftar di Dapodik / PD-Dikti" },
  { key: "ktp_kia", label: "KTP / KIA (anak < 17 tahun)" },
  { key: "kartu_pelajar_mahasiswa", label: "Kartu Pelajar Muhammadiyah / KTM" },
  { key: "raport_khs", label: "Raport / KHS terakhir" },
  { key: "bpjs", label: "BPJS" },
  { key: "pas_foto", label: "Pas foto terbaru" },
  { key: "bukti_pembayaran", label: "Bukti pembayaran" },
] as const;

export type DocumentKey = typeof REQUIRED_DOCUMENTS[number]["key"];

export const FEES = {
  pesertaPerOrang: 100_000,
  officialPerOrang: 50_000,
  voliFlat: 1_500_000,
} as const;

export const BANK_INFO = {
  bankLabel: "Transfer ke rekening",
  accountName: "Nur Subekti",
  accountNumber: "00000000",
} as const;
