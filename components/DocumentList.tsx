// components/DocumentList.tsx
"use client";
import { useEffect, useMemo, useState } from "react";

type FileRow = { name: string; size?: number };

export function DocumentList() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [analysis, setAnalysis] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/files",{cache:"no-store"}).then(r=>r.json()).then(d=>{
      const arr=(d.files||[]) as string[]; setFiles(arr.map(n=>({name:n})));
    });
  }, []);

  const list = useMemo(()=>files,[files]);

  const analyze = async (name: string) => {
    setBusy(p=>({...p,[name]:true}));
    try{
      const res = await fetch("/api/ai-analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({filename:name})});
      const data = await res.json();
      if (res.ok) setAnalysis(a=>({...a,[name]: data.result}));
    } finally {
      setBusy(p=>({...p,[name]:false}));
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold tracking-tight">Документи</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-white/60 border border-white"> {list.length} файлів</span>
      </div>

      <ul className="divide-y divide-slate-200">
        {list.map((f)=>(
          <li key={f.name} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-mono text-sm text-slate-900">{f.name}</p>
              {analysis[f.name] && <p className="text-sm text-slate-700 mt-1">{analysis[f.name]}</p>}
            </div>
            <button
              onClick={()=>analyze(f.name)}
              disabled={!!busy[f.name]}
              className="px-3 py-1.5 rounded-xl bg-[linear-gradient(90deg,#4e8cff,#6f74ff)] text-white text-sm shadow hover:shadow-md disabled:opacity-60"
            >
              {busy[f.name] ? "Аналіз…" : "Аналізувати"}
            </button>
          </li>
        ))}
        {list.length===0 && <li className="py-6 text-sm text-slate-600">Документи відсутні</li>}
      </ul>
    </div>
  );
}