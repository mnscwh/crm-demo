"use client";

import { useEffect, useState } from "react";

export function DocumentList({
  onSelect,
  refreshSignal,
}: {
  onSelect: (doc: any) => void;
  refreshSignal: number; // просто число, увеличиваем после upload
}) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/documents", { cache: "no-store" });
      const d = await r.json();
      setDocs(Array.isArray(d) ? d : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refreshSignal]);

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium text-gray-900">Список документів</h2>
        <button
          onClick={load}
          className="text-xs text-indigo-600 hover:text-indigo-800"
        >
          Оновити
        </button>
      </div>
      {loading && <div className="text-sm text-gray-500">Завантаження…</div>}
      <ul className="divide-y text-sm">
        {docs.map((d) => (
          <li
            key={d.id}
            onClick={() => onSelect(d)}
            className="py-2 cursor-pointer hover:bg-indigo-50 px-2 rounded-md"
          >
            {d.title}
          </li>
        ))}
        {!loading && docs.length === 0 && (
          <li className="py-2 text-gray-500">Немає документів</li>
        )}
      </ul>
    </div>
  );
}