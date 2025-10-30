// components/UploadPanel.tsx
"use client";
import { useRef, useState } from "react";

export function UploadPanel() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    setBusy(true); setMsg("");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setBusy(false);
    setMsg(res.ok ? `✅ Завантажено: ${data.name}` : `❌ ${data.error}`);
  };

  return (
    <div className="card p-5">
      <h2 className="text-lg font-semibold mb-1">Портал документів</h2>
      <p className="text-sm text-slate-600 mb-4">Підтримує: TXT, PDF, DOCX, MD</p>
      <div
        className="border border-dashed border-slate-300 rounded-2xl py-8 flex flex-col items-center justify-center bg-white/70"
        onDragOver={(e: React.DragEvent<HTMLDivElement>)=>e.preventDefault()}
        onDrop={(e: React.DragEvent<HTMLDivElement>)=>{e.preventDefault(); const f=e.dataTransfer.files?.[0]; if(f) upload(f);}}
      >
        <button onClick={()=>inputRef.current?.click()} disabled={busy}
          className="px-5 py-2 rounded-xl bg-[linear-gradient(90deg,#6b8bff,#8f78ff)] text-white shadow-md hover:shadow-lg">
          {busy? "Завантаження…" : "Обрати файл"}
        </button>
        <input ref={inputRef} type="file" hidden onChange={(e)=>e.target.files && upload(e.target.files[0])}/>
        {msg && <p className="text-sm mt-3 text-slate-700">{msg}</p>}
      </div>
    </div>
  );
}