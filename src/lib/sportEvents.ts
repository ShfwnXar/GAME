import type { Jenjang, Sport } from "./constants";

export type EventItem = { id: string; label: string; kind: "INDIVIDU" | "ESTAFET" | "BEREGU" };

const ATLETIK_SMP_SMA: EventItem[] = [
  { id: "100m", label: "100 meter", kind: "INDIVIDU" },
  { id: "400m", label: "400 meter", kind: "INDIVIDU" },
  { id: "800m", label: "800 meter", kind: "INDIVIDU" },
  { id: "4x400", label: "Estafet 4x400 m", kind: "ESTAFET" },
  { id: "lj", label: "Lompat Jauh", kind: "INDIVIDU" },
  { id: "tp", label: "Tolak Peluru", kind: "INDIVIDU" },
];

const ATLETIK_MHS: EventItem[] = [
  { id: "100m", label: "100 meter", kind: "INDIVIDU" },
  { id: "400m", label: "400 meter", kind: "INDIVIDU" },
];

const VOLI: EventItem[] = [
  { id: "beregu_putra", label: "Beregu Putra", kind: "BEREGU" },
  { id: "beregu_putri", label: "Beregu Putri", kind: "BEREGU" },
];

const BULUTANGKIS: EventItem[] = [
  { id: "ts_putra", label: "Tunggal Putra", kind: "INDIVIDU" },
  { id: "ts_putri", label: "Tunggal Putri", kind: "INDIVIDU" },
  { id: "gd_putra", label: "Ganda Putra", kind: "BEREGU" },
  { id: "gd_putri", label: "Ganda Putri", kind: "BEREGU" },
  { id: "br_putra", label: "Beregu Putra", kind: "BEREGU" },
  { id: "br_putri", label: "Beregu Putri", kind: "BEREGU" },
];

const TENISMEJA: EventItem[] = [
  { id: "tunggal_putra", label: "Tunggal Putra", kind: "INDIVIDU" },
  { id: "tunggal_putri", label: "Tunggal Putri", kind: "INDIVIDU" },
  { id: "ganda_putra", label: "Ganda Putra", kind: "BEREGU" },
  { id: "ganda_putri", label: "Ganda Putri", kind: "BEREGU" },
  { id: "ganda_campuran", label: "Ganda Campuran", kind: "BEREGU" },
  { id: "beregu_putra", label: "Beregu Putra", kind: "BEREGU" },
  { id: "beregu_putri", label: "Beregu Putri", kind: "BEREGU" },
];

const PANAHAN: Record<string, EventItem[]> = {
  "Standar Nasional": [
    { id: "sn_sd_20", label: "SD (20 m)", kind: "INDIVIDU" },
    { id: "sn_smp_30", label: "SMP (30 m)", kind: "INDIVIDU" },
  ],
  Barebow: [
    { id: "bb_sd_10", label: "SD (10 m)", kind: "INDIVIDU" },
    { id: "bb_smp_sma_20", label: "SMP-SMA (20 m)", kind: "INDIVIDU" },
  ],
  Recurve: [
    { id: "rc_smp_sma_60", label: "SMP-SMA (60 m)", kind: "INDIVIDU" },
    { id: "rc_mhs_70", label: "Mahasiswa (70 m)", kind: "INDIVIDU" },
  ],
  Compound: [{ id: "cp_smp_sma_50", label: "SMP-SMA (50 m)", kind: "INDIVIDU" }],
  Horsebow: [
    { id: "hb_sd_10", label: "SD (10 m)", kind: "INDIVIDU" },
    { id: "hb_smp_20", label: "SMP (20 m)", kind: "INDIVIDU" },
    { id: "hb_mhs_30", label: "Mahasiswa (30 m)", kind: "INDIVIDU" },
  ],
};

export function getEvents(sport: Sport, jenjang: Jenjang, divisiPanahan?: string | null): EventItem[] {
  if (sport === "Atletik") return jenjang === "Mahasiswa" ? ATLETIK_MHS : ATLETIK_SMP_SMA;
  if (sport === "Voli Indoor") return VOLI;
  if (sport === "Bulu Tangkis") return BULUTANGKIS;
  if (sport === "Tenis Meja") return TENISMEJA;
  if (sport === "Panahan") return divisiPanahan ? PANAHAN[divisiPanahan] || [] : [];
  return [];
}

export function validateAtletikRules(picked: Array<{ kind: "INDIVIDU" | "ESTAFET" | "BEREGU" }>) {
  const individu = picked.filter((p) => p.kind === "INDIVIDU").length;
  const estafet = picked.filter((p) => p.kind === "ESTAFET").length;
  if (individu > 2) return "Atletik: maksimal 2 nomor individu per atlet.";
  if (estafet > 1) return "Atletik: maksimal 1 nomor estafet per atlet.";
  return "";
}
