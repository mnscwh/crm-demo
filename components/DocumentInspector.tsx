"use client";

import { useState } from "react";

export function DocumentInspector({ doc }: { doc: any }) {
  const [aiSummary, setAiSummary] = useState<string>("");
  const [lawRefs, setLawRefs] = useState<any[]>([]);
  const [linkedCases, setLinkedCases] = useState<any[]>([]);

  async function runFullAI() {
    setAiSummary("🔄 Аналіз документу...");

    // 🧠 тимчасовий fallback-текст (щоб все працювало без OCR)
    const text = `
Договір постачання між ТОВ Альфа та ФОП Бета.
Суперечка щодо зміни умов договору постачання та оплати.
Відповідно до ст. 651 Цивільного кодексу України можливе розірвання договору.
    `;

    // 1️⃣ знайти релевантні норми
    const lawRes = await fetch("/api/lawdb-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then((r) => r.json());

    // 2️⃣ знайти зв'язані справи
    const linkRes = await fetch("/api/ai-linker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc: { text } }),
    }).then((r) => r.json());

    setLawRefs(lawRes.results || []);
    setLinkedCases(linkRes.linkedCases || []);
    setAiSummary("✅ AI-аналіз завершено");
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-xl border shadow-sm">
      <h2 className="text-xl font-semibold text-indigo-700">{doc.title}</h2>

      <button
        onClick={runFullAI}
        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
      >
        ⚖️ AI-аналіз (Law DB + зв’язки)
      </button>

      {aiSummary && <p className="text-sm text-gray-600">{aiSummary}</p>}

      {lawRefs.length > 0 && (
        <div className="p-3 bg-indigo-50 border rounded-lg text-sm">
          <h3 className="font-medium text-indigo-700 mb-1">📘 Виявлено норми:</h3>
          <ul className="list-disc ml-4">
            {lawRefs.map((l: any) => (
              <li key={l.id}>
                {l.type} {l.article || ""} — {l.summary}
              </li>
            ))}
          </ul>
        </div>
      )}

      {linkedCases.length > 0 && (
        <div className="p-3 bg-sky-50 border rounded-lg text-sm">
          <h3 className="font-medium text-sky-700 mb-1">⚖️ Ймовірно пов’язані справи:</h3>
          <ul className="list-disc ml-4">
            {linkedCases.map((c: any) => (
              <li key={c.id}>{c.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}