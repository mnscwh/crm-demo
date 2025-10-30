// === FILE: components/DocumentInspector.tsx ===
"use client";

import { useState, useEffect } from "react";

export function DocumentInspector({ doc }: { doc: any }) {
  const [ocr, setOcr] = useState<string>("(Завантаження OCR...)");
  const [aiSummary, setAiSummary] = useState<string>("");

  useEffect(() => {
    if (!doc?.file?.pdfa) return;

    const name = doc.file.pdfa.split("/").pop()?.replace(".pdf", ".json");
    fetch(`/docs_ocr/${name}`)
      .then((r) => r.json())
      .then((data) => setOcr(data.text?.slice(0, 2000) || "(OCR порожній)"))
      .catch(() => setOcr("(OCR не знайдено)"));
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
      <h2 className="text-xl font-semibold text-indigo-700">
        {doc.title}
      </h2>
      <div className="text-sm text-gray-600">
        <p><strong>Тип:</strong> {doc.type}</p>
        <p><strong>Статус:</strong> {doc.status}</p>
        <p><strong>SHA256:</strong> {doc.versions?.[0]?.sha256?.slice(0, 16)}...</p>
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