"use client";
import { useEffect, useState } from "react";

export function DocsModal({ type, onClose }:{ type:"all"|"overdue"|"pending"; onClose:()=>void }) {
  const [files, setFiles] = useState<string[]>([]);
  const [deadlineIdx, setDeadlineIdx] = useState<Record<string,string>>({});

  useEffect(()=>{
    fetch("/api/files",{cache:"no-store"}).then(r=>r.json()).then(d=>setFiles(d.files || []));
    fetch("/api/deadlines",{cache:"no-store"}).then(r=>r.json()).then((d)=>{
      const idx:Record<string,string>={};
      const today=new Date().toISOString().slice(0,10);
      (d.data||[]).forEach((t:any)=>{
        const overdue = t.status!=="done" && t.deadline<today;
        idx[t.task]=overdue?"overdue":t.status;
      });
      setDeadlineIdx(idx);
    });
  },[]);

  const filtered = files.filter(f=>{
    if (type==="all") return true;
    const val = Object.values(deadlineIdx).find(s=>s.includes(f.split(".")[0]));
    return type==="overdue" ? val==="overdue" : val==="pending";
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute right-4 top-3 text-slate-500 hover:text-slate-700">✕</button>
        <h2 className="text-lg font-semibold mb-4">
          {type==="all"?"Усі документи":type==="overdue"?"Прострочені документи":"Очікують виконання"}
        </h2>
        <ul className="divide-y divide-slate-200 max-h-80 overflow-auto">
          {filtered.map(f=>(
            <li key={f} className="py-2 flex justify-between items-center">
              <span className="font-mono text-sm">{f}</span>
              <button className="text-sky-600 hover:text-sky-800 text-sm">Відкрити</button>
            </li>
          ))}
          {filtered.length===0 && <li className="py-6 text-center text-slate-500 text-sm">Немає документів</li>}
        </ul>
      </div>
    </div>
  );
}