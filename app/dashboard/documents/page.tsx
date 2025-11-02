"use client";

import { useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { DocumentList } from "@/components/DocumentList";
import { DocumentInspector } from "@/components/DocumentInspector";

export default function DocumentsPage() {
  const [selected, setSelected] = useState<any | null>(null);
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-indigo-800">Документи</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <UploadZone onUploaded={() => setRefresh((n) => n + 1)} />
          <DocumentList onSelect={setSelected} refreshSignal={refresh} />
        </div>

        {selected ? (
          <DocumentInspector doc={selected} />
        ) : (
          <div className="bg-white rounded-xl border shadow-sm p-6 text-gray-500">
            Оберіть документ зі списку…
          </div>
        )}
      </div>
    </div>
  );
}