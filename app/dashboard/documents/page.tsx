"use client";
import { useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { DocumentInspector } from "@/components/DocumentInspector";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  return (
    <div className="p-6 space-y-6">
      <UploadZone
        onUploaded={(doc) => {
          setDocs((prev) => [doc, ...prev]);
          setSelected(doc);
        }}
      />

      <div className="grid grid-cols-3 gap-4">
        {docs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelected(doc)}
            className="p-3 border rounded-lg cursor-pointer hover:bg-indigo-50"
          >
            <h3 className="font-medium text-indigo-700">{doc.name}</h3>
            <p className="text-xs text-gray-500">{doc.type}</p>
          </div>
        ))}
      </div>

      {selected && (
        <div>
          <DocumentInspector doc={selected} />
        </div>
      )}
    </div>
  );
}