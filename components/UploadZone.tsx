"use client";

import { useState } from "react";

export function UploadZone({ onUploaded }: { onUploaded: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: formData });
      const d = await r.json();
      if (!r.ok || d.ok === false) {
        setErr(d.error || `HTTP ${r.status}`);
      } else {
        onUploaded(); // попросим родителя перечитать список
      }
    } catch (e: any) {
      setErr(e.message || "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <div className="font-medium text-gray-900 mb-2">Додати документ</div>
      <label className="inline-flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-900 cursor-pointer">
        <input type="file" onChange={onChange} hidden />
        📤 Обрати файл
      </label>
      {busy && <div className="text-sm text-gray-500 mt-2">🔄 Завантаження…</div>}
      {err && (
        <div className="text-sm text-rose-600 mt-2 border border-rose-200 rounded p-2 bg-rose-50">
          {err}
        </div>
      )}
    </div>
  );
}