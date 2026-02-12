import React from "react";

function chip(ok: boolean) {
  return ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200";
}

export function WizardStepsHeader({ step, step1Ok, step2Ok, step3Ok }: { step: 1 | 2 | 3; step1Ok: boolean; step2Ok: boolean; step3Ok: boolean }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-lg font-semibold text-gray-900">Pendaftaran Muhammadiyah Games 2026</div>
          <div className="text-sm text-gray-600 mt-1">Entry by Sport → Entry by Number → Entry by Name & Dokumen</div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xs px-2 py-1 rounded-lg border ${chip(step1Ok)}`}>Step 1</div>
          <div className={`text-xs px-2 py-1 rounded-lg border ${chip(step2Ok)}`}>Step 2</div>
          <div className={`text-xs px-2 py-1 rounded-lg border ${chip(step3Ok)}`}>Step 3</div>
        </div>
      </div>

      <div className="mt-4 grid md:grid-cols-3 gap-3">
        <div className={`border rounded-2xl p-4 ${step === 1 ? "bg-emerald-50 border-emerald-200" : "bg-white"}`}>
          <div className="font-semibold">Step 1</div>
          <div className="text-sm text-gray-600 mt-1">Pilih cabang + jenjang + jumlah atlet & official</div>
        </div>
        <div className={`border rounded-2xl p-4 ${step === 2 ? "bg-emerald-50 border-emerald-200" : "bg-white"}`}>
          <div className="font-semibold">Step 2</div>
          <div className="text-sm text-gray-600 mt-1">Pilih nomor perlombaan yang relevan</div>
        </div>
        <div className={`border rounded-2xl p-4 ${step === 3 ? "bg-emerald-50 border-emerald-200" : "bg-white"}`}>
          <div className="font-semibold">Step 3</div>
          <div className="text-sm text-gray-600 mt-1">Data diri + upload dokumen kontingen/atlet/official</div>
        </div>
      </div>
    </div>
  );
}
