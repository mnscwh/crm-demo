// === FILE: components/DocumentInspector.tsx ===
"use client";

import { useState, useEffect } from "react";

export function DocumentInspector({ doc }: { doc: any }) {
  const [ocr, setOcr] = useState<string>("(Завантаження OCR...)");
  const [aiSummary, setAiSummary] = useState<string>("");

  // Мапи для перекладу типів та статусів документів
  const typeMap: Record<string, string> = {
    contract: "Договір",
    claim: "Позов",
    power: "Довіреність",
  };

  const statusMap: Record<string, string> = {
    draft: "Чернетка",
    signed: "Підписано",
    archived: "Архівовано",
  };

  // Підвантаження OCR при виборі документа
  useEffect(() => {
    if (!doc?.versions?.[0]?.file?.pdfa) return;

    const name = doc.versions[0].file.pdfa.split("/").pop()?.replace(".pdf", ".json");
    fetch(`/docs_ocr/${name}`)
      .then((r) => r.json())
      .then((data) => setOcr(data.text?.slice(0, 2000) || "(OCR порожній)"))
      .catch(() => setOcr("(OCR не знайдено)"));
  }, [doc]);

  // Запуск AI-аналізу документу
  const runAI = async () => {
    const q = `Проаналізуй документ: виявити ризики, строки, невідповідності.`;
    const r = await fetch("/api/ai-on-docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, filename: doc.versions?.[0]?.file?.pdfa }),
    });
    const d = await r.json();
    setAiSummary(d.answer || "Недостатньо даних для аналізу.");
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-xl border shadow-sm">
      <h2 className="text-xl font-semibold text-indigo-700">{doc.title}</h2>

      <div className="text-sm text-gray-700 space-y-1">
        <p>
          <strong>Тип:</strong>{" "}
          {typeMap[doc.type] || doc.type}
        </p>
        <p>
          <strong>Статус:</strong>{" "}
          {statusMap[doc.status] || doc.status}
        </p>
        <p>
          <strong>SHA256:</strong>{" "}
          {doc.versions?.[0]?.sha256
            ? doc.versions[0].sha256.slice(0, 16) + "..."
            : "(немає)"}
        </p>
      </div>

      <button
        onClick={runAI}
        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
      >
        🔍 AI-аналіз документу
      </button>

      {aiSummary && (
        <div className="p-3 rounded-md bg-indigo-50 border text-gray-800 text-sm whitespace-pre-wrap">
          {aiSummary}
        </div>
      )}

      <details className="mt-3">
        <summary className="text-sm text-indigo-600 cursor-pointer hover:underline">
          Переглянути OCR-текст
        </summary>
        <pre className="mt-2 text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded-md max-h-80 overflow-y-auto">
          {ocr}
        </pre>
      </details>
    </div>
  );
}