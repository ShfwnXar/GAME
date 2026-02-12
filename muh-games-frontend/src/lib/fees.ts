import type { Sport } from "./constants";

export function calcFees(sport: Sport, jumlahAtlet: number, jumlahOfficial: number) {
  const isVoli = sport === "Voli Indoor";
  const peserta = isVoli ? 1500000 * 1 : 100000 * jumlahAtlet;
  const official = 50000 * jumlahOfficial;
  const total = peserta + official;
  return { peserta, official, total };
}
