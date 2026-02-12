import React, { useMemo, useRef, useState } from "react";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function formatBytes(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

function labelFromAccept(acceptTypes: string[]) {
  const hasPdf = acceptTypes.includes("application/pdf");
  const hasJpeg = acceptTypes.includes("image/jpeg");
  const hasPng = acceptTypes.includes("image/png");
  const parts: string[] = [];
  if (hasPdf) parts.push("PDF");
  if (hasJpeg) parts.push("JPG");
  if (hasPng) parts.push("PNG");
  return parts.length ? parts.join("/") : "FILE";
}

function acceptAttrFromAccept(acceptTypes: string[]) {
  const parts: string[] = [];
  if (acceptTypes.includes("application/pdf")) parts.push(".pdf");
  if (acceptTypes.includes("image/jpeg")) parts.push(".jpg", ".jpeg");
  if (acceptTypes.includes("image/png")) parts.push(".png");
  return parts.join(",");
}

type Props = {
  documentName: string;
  documentLabel: string;
  required?: boolean;
  file: File | null;
  uploaded: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  maxBytes?: number;
  acceptTypes?: string[];
};

export function DocumentUploadCard({
  documentName,
  documentLabel,
  required = false,
  file,
  uploaded,
  onUpload,
  onRemove,
  maxBytes = 2 * 1024 * 1024,
  acceptTypes = ["application/pdf", "image/jpeg", "image/png"],
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string>("");

  const acceptAttr = useMemo(() => acceptAttrFromAccept(acceptTypes), [acceptTypes]);
  const acceptLabel = useMemo(() => labelFromAccept(acceptTypes), [acceptTypes]);

  const validate = (f: File) => {
    if (f.size > maxBytes) return `Ukuran file melebihi batas ${formatBytes(maxBytes)}. File kamu: ${formatBytes(f.size)}.`;
    if (!acceptTypes.includes(f.type)) return `Tipe file tidak didukung. Gunakan ${acceptLabel}.`;
    return "";
  };

  const pickFile = () => {
    setError("");
    inputRef.current?.click();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const f = e.target.files?.[0] || null;
    e.target.value = "";
    if (!f) return;
    const err = validate(f);
    if (err) {
      setError(err);
      return;
    }
    onUpload(f);
  };

  return (
    <div className="border rounded-2xl p-4 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {documentLabel} {required ? <span className="text-red-600">*</span> : null}
          </div>
          <div className="text-xs text-gray-500 mt-1">Maks 2 MB • {acceptLabel}</div>
        </div>

        <div
          className={cx(
            "text-xs px-2 py-1 rounded-lg border",
            uploaded ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200"
          )}
        >
          {uploaded ? "Terunggah" : "Belum"}
        </div>
      </div>

      <div className="mt-3">
        {file ? (
          <div className="text-xs text-gray-700 bg-gray-50 border rounded-xl px-3 py-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-medium">{file.name}</div>
              <div className="text-gray-500 mt-0.5">{formatBytes(file.size)}</div>
            </div>
            <button type="button" onClick={onRemove} className="shrink-0 px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-xs">
              Hapus
            </button>
          </div>
        ) : (
          <div className="text-xs text-gray-600 bg-gray-50 border rounded-xl px-3 py-2">Belum ada file dipilih.</div>
        )}
      </div>

      {error ? <div className="mt-3 text-xs text-red-600">{error}</div> : null}

      <div className="mt-4 flex items-center justify-between gap-2">
        <input ref={inputRef} name={documentName} type="file" className="hidden" accept={acceptAttr} onChange={onChange} />
        <button type="button" onClick={pickFile} className="w-full px-4 py-2 rounded-xl bg-[#0C2C4A] text-white text-sm hover:opacity-90">
          Pilih File
        </button>
      </div>
    </div>
  );
}
