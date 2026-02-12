import React from "react";

type Props = {
  muhammadiyahLogoSrc: string;
  partnerLogoSrcs?: Array<string | null>;
};

export function LogoBar({ muhammadiyahLogoSrc, partnerLogoSrcs = [] }: Props) {
  const slots = Array.from({ length: 5 }).map((_, i) => partnerLogoSrcs[i] ?? null);

  return (
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Muhammadiyah logo (always) */}
        <div className="flex items-center gap-3 min-w-[140px]">
          <img
            src={muhammadiyahLogoSrc}
            alt="Logo Muhammadiyah"
            className="h-10 w-auto object-contain"
          />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-[#0C2C4A]">Muhammadiyah Games 2026</div>
            <div className="text-xs text-gray-500">Portal Pendaftaran</div>
          </div>
        </div>

        {/* 5 logo slots */}
        <div className="flex items-center gap-3">
          {slots.map((src, idx) => (
            <div
              key={idx}
              className="h-10 w-20 rounded-md border bg-gray-50 flex items-center justify-center overflow-hidden"
              title={src ? "Logo partner" : "Slot logo (kosong)"}
            >
              {src ? (
                <img src={src} alt={`Logo Partner ${idx + 1}`} className="h-9 w-auto object-contain" />
              ) : (
                <span className="text-[10px] text-gray-400">LOGO {idx + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
