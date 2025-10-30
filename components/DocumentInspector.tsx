"use client";

import { useState, useEffect } from "react";
import { getDocsForCase, getDocsForClient } from "@/lib/linker";

export function DocumentInspector({ doc }: { doc: any }) {
  const [ocr, setOcr] = useState<string>("(Завантаження OCR...)");
  const [aiSummary, setAiSummary] = useState<string>("");
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    if (!doc?.file?.pdfa) return;

    const name = doc.file.pdfa.split("/").pop()?.replace(".pdf", ".json");
    fetch(`/docs_ocr/${name}`)
      .then((r) => r.json())
      .then((data) => setOcr(data.text?.slice(0, 2000) || "(OCR порожній)"))
      .catch(() => setOcr("(OCR не знайдено)"));

    // AI-зв’язки
    fetch(`/api/linker`)
      .then((r) => r.json())
      .then((d) => {
        const rel = d.links.filter((l: any) =>
          l.documents.some((x: any) => x.id === doc.id)
        );
        setRelated(rel);
      })
      .catch(() => setRelated([]));
  }, [doc]);

  const runAI = async () => {
    const q = `Проаналізуй документ: виявити ризики, строки, невідповідності.`;
    const r = await fetch("/api/ai-on-docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, filename: doc.file.pdfa }),
    });
    const d = await r.json();
    setAiSummary(d.answer || "Недостатньо даних.");
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-xl border shadow-sm">
      <h2 className="text-xl font-semibold text-indigo-700">{doc.title}</h2>
      <div className="text-sm text-gray-600">
        <p><strong>Тип:</strong> {doc.type}</p>
        <p><strong>Статус:</strong> {doc.status}</p>
      </div>

      <button
        onClick={runAI}
        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
      >
        🔍 AI-аналіз документу
      </button>

      {aiSummary && (
        <div className="p-3 rounded-md bg-indigo-50 border text-gray-800 text-sm">
          {aiSummary}
        </div>
      )}

      {related.length > 0 && (
        <div className="p-3 bg-sky-50 border rounded-lg">
          <h3 className="text-sm font-medium text-indigo-700 mb-1">
            Пов’язані справи / клієнти:
          </h3>
          <ul className="text-sm text-gray-700 list-disc ml-5">
            {related.map((l) => (
              <li key={l.caseId}>
                Справа #{l.caseId}, клієнт #{l.clientId} ({l.documents.length} документів)
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="mt-3">
        <summary className="text-sm text-indigo-600 cursor-pointer">
          Переглянути OCR-текст
        </summary>
        <pre className="mt-2 text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded-md max-h-80 overflow-y-auto">
          {ocr}
        </pre>
      </details>
    </div>
  );
}