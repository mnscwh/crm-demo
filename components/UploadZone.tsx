"use client";
import { useState } from "react";

export function UploadZone({ onUploaded }: { onUploaded: (doc: any) => void }) {
  const [status, setStatus] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    setStatus("🔄 Завантаження...");

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.ok) {
      setStatus("✅ Завантажено!");
      onUploaded(data);
    } else {
      setStatus("❌ " + data.error);
    }
  }

  return (
    <div className="p-4 border-2 border-dashed rounded-xl text-center bg-white/50">
      <input type="file" onChange={handleFile} className="mb-2" />
      <p className="text-sm text-gray-600">{status || "Перетягни або вибери файл"}</p>
    </div>
  );
}