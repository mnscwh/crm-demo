"use client";
import { useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { DocumentList } from "@/components/DocumentList";

export default function DocumentsPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="p-6 space-y-6">
      <UploadZone
        onUploaded={() => {
          setRefresh((r) => r + 1);
        }}
      />

      <DocumentList key={refresh} />
    </div>
  );
}