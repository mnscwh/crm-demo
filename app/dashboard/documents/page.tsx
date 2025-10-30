// === FILE: app/dashboard/documents/page.tsx ===
"use client";

import { useState, useEffect } from "react";
import { DocumentInspector } from "@/components/DocumentInspector";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    fetch("/data/doc_manifest.json")
      .then((r) => r.json())
      .then((d) => setDocs(d));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-indigo-800">Документи</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h2 className="font-medium text-gray-900 mb-2">Список документів</h2>
          <ul className="divide-y text-sm">
            {docs.map((d) => (
              <li
                key={d.id}
                onClick={() => setSelected(d)}
                className="py-2 cursor-pointer hover:bg-indigo-50 px-2 rounded-md"
              >
                {d.title}
              </li>
            ))}
          </ul>
        </div>

        {selected && <DocumentInspector doc={selected} />}
      </div>
    </div>
  );
}