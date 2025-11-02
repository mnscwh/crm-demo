"use client";
import { useEffect, useState } from "react";
import { DocumentInspector } from "./DocumentInspector";

export function DocumentList() {
  const [docs, setDocs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadDocs() {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocs(data || []);
    } catch (e) {
      console.error("❌ Cannot load documents:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocs();
  }, []);

  if (loading) return <p className="text-gray-500">⏳ Завантаження документів...</p>;

  return (
    <div className="space-y-4">
      {docs.length === 0 && <p className="text-gray-500">Документів ще немає.</p>}

      <div className="grid grid-cols-3 gap-4">
        {docs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelected(doc)}
            className={`p-3 border rounded-lg cursor-pointer hover:bg-indigo-50 ${
              selected?.id === doc.id ? "border-indigo-500" : "border-gray-200"
            }`}
          >
            <h3 className="font-medium text-indigo-700">{doc.name}</h3>
            <p className="text-xs text-gray-500">{doc.type}</p>
            <p className="text-xs text-gray-400">{new Date(doc.uploaded).toLocaleString("uk-UA")}</p>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-4">
          <DocumentInspector doc={selected} />
        </div>
      )}
    </div>
  );
}