import React, { useMemo, useState } from "react";
import type { NumberEntry, Step1Data } from "../RegistrationWizard";
import { getEvents, validateAtletikRules } from "../../lib/sportEvents";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export function Step2Numbers({
  step1,
  value,
  onChange,
  onBack,
  onNext,
}: {
  step1: Step1Data;
  value: NumberEntry[];
  onChange: (v: NumberEntry[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [err, setErr] = useState("");

  const events = useMemo(() => {
    if (!step1.sport || !step1.jenjang) return [];
    return getEvents(step1.sport, step1.jenjang, step1.divisiPanahan || null);
  }, [step1.sport, step1.jenjang, step1.divisiPanahan]);

  const pickedKinds = useMemo(() => value.map((v) => ({ kind: v.kind })), [value]);

  const totalAtlet = useMemo(() => value.reduce((a, b) => a + b.jumlahAtlet, 0), [value]);

  const addEvent = (eventId: string) => {
    setErr("");
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;

    if (value.some((v) => v.eventId === ev.id)) return;

    const next = [...value, { eventId: ev.id, nomor: ev.label, kind: ev.kind, jumlahAtlet: 0, jumlahOfficial: 0 }];

    if (step1.sport === "Atletik") {
      const msg = validateAtletikRules(next.map((n) => ({ kind: n.kind })));
      if (msg) {
        setErr(msg);
        return;
      }
    }

    onChange(next);
  };

  const removeRow = (eventId: string) => {
    setErr("");
    onChange(value.filter((v) => v.eventId !== eventId));
  };

  const setRow = (eventId: string, patch: Partial<NumberEntry>) => {
    setErr("");
    const next = value.map((v) => (v.eventId === eventId ? { ...v, ...patch } : v));

    const newTotalAtlet = next.reduce((a, b) => a + b.jumlahAtlet, 0);
    if (newTotalAtlet > step1.jumlahAtlet) {
      setErr(`Total atlet per nomor (${newTotalAtlet}) melebihi jumlah atlet Step 1 (${step1.jumlahAtlet}).`);
      return;
    }

    if (step1.sport === "Atletik") {
      const msg = validateAtletikRules(next.map((n) => ({ kind: n.kind })));
      if (msg) {
        setErr(msg);
        return;
      }
    }

    onChange(next);
  };

  const canNext = value.length > 0 && totalAtlet <= step1.jumlahAtlet;

  return (
    <div className="mt-6 bg-white border rounded-2xl p-5 shadow-sm">
      <div className="text-lg font-semibold text-gray-900">Step 2 — Entry by Number</div>
      <div className="text-sm text-gray-600 mt-1">Nomor yang tampil otomatis sesuai cabang + jenjang/divisi. Total atlet per nomor tidak boleh melebihi jumlah atlet Step 1.</div>

      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <div className="border rounded-2xl p-4 bg-gray-50">
          <div className="font-semibold text-gray-900">Daftar Nomor</div>
          <div className="text-sm text-gray-600 mt-1">Klik untuk menambahkan.</div>

          <div className="mt-4 space-y-2">
            {events.length ? (
              events.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => addEvent(ev.id)}
                  className={cx("w-full text-left px-3 py-2 rounded-xl border bg-white hover:bg-gray-50", value.some((v) => v.eventId === ev.id) ? "opacity-50 cursor-not-allowed" : "")}
                  disabled={value.some((v) => v.eventId === ev.id)}
                >
                  <div className="text-sm font-medium">{ev.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{ev.kind}</div>
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-600">Pilih cabang dan jenjang di Step 1 terlebih dahulu.</div>
            )}
          </div>
        </div>

        <div className="border rounded-2xl p-4 bg-gray-50">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-gray-900">Nomor Dipilih</div>
              <div className="text-sm text-gray-600 mt-1">Isi jumlah atlet per nomor (akumulasi max Step 1).</div>
            </div>
            <div className={cx("text-xs px-2 py-1 rounded-lg border", totalAtlet <= step1.jumlahAtlet ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200")}>
              Total Atlet: {totalAtlet}/{step1.jumlahAtlet}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {value.length ? (
              value.map((row) => (
                <div key={row.eventId} className="bg-white border rounded-2xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{row.nomor}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{row.kind}</div>
                    </div>
                    <button type="button" onClick={() => removeRow(row.eventId)} className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-xs">
                      Hapus
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Jumlah Atlet</label>
                      <input
                        type="number"
                        value={row.jumlahAtlet}
                        onChange={(e) => setRow(row.eventId, { jumlahAtlet: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                        className="mt-1 w-full border rounded-xl px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Jumlah Official</label>
                      <input
                        type="number"
                        value={row.jumlahOfficial}
                        onChange={(e) => setRow(row.eventId, { jumlahOfficial: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                        className="mt-1 w-full border rounded-xl px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600 bg-white border rounded-xl px-3 py-2">Belum ada nomor dipilih.</div>
            )}
          </div>

          {err ? <div className="mt-4 text-sm text-red-600">{err}</div> : null}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <button type="button" onClick={onBack} className="px-4 py-2 rounded-xl bg-white border text-gray-700 hover:bg-gray-50">
          Kembali
        </button>
        <button type="button" disabled={!canNext} onClick={onNext} className={cx("px-4 py-2 rounded-xl text-white", canNext ? "bg-[#0C2C4A] hover:opacity-90" : "bg-gray-300 cursor-not-allowed")}>
          Lanjut Step 3
        </button>
      </div>
    </div>
  );
}
