// === FILE: components/UploadPanel.tsx ===
"use client";

import { useRef, useState } from "react";

export function UploadPanel({ onUploaded }: { onUploaded?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setErr("");
    setMsg("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok || data.ok === false) {
        setErr(data.error || `HTTP ${res.status}`);
        setMsg("");
      } else {
        setMsg(`✅ Завантажено: ${data.doc?.title || file.name}`);
        if (onUploaded) onUploaded();
      }
    } catch (e: any) {
      console.error("Upload error:", e);
      setErr(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  return (
    <div className="card p-5 bg-white border rounded-2xl shadow-sm">
      <h2 className="text-lg font-semibold mb-1">Портал документів</h2>
      <p className="text-sm text-slate-600 mb-4">
        Підтримує: PDF, DOCX, ODT, XLSX, CSV, JSON, YAML, JPG, TIFF, PNG
      </p>

      <div
        className={`border-2 border-dashed rounded-2xl py-8 flex flex-col items-center justify-center transition ${
          busy ? "opacity-70" : "opacity-100"
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={`px-5 py-2 rounded-xl text-white shadow-md transition ${
            busy
              ? "bg-gray-400"
              : "bg-[linear-gradient(90deg,#6b8bff,#8f78ff)] hover:shadow-lg"
          }`}
        >
          {busy ? "🔄 Завантаження…" : "📤 Обрати файл"}
        </button>
        <input ref={inputRef} type="file" hidden onChange={handleFileChange} />

        {msg && (
          <p className="text-sm mt-3 text-green-700 bg-green-50 border border-green-200 rounded px-3 py-1">
            {msg}
          </p>
        )}

        {err && (
          <p className="text-sm mt-3 text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-1">
            ❌ {err}
          </p>
        )}
      </div>
    </div>
  );
}