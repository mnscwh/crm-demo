"use client";
import { useState } from "react";

export function DocumentInspector({ doc }: { doc: any }) {
  const [aiSummary, setAiSummary] = useState<string>("");
  const [lawRefs, setLawRefs] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  async function runAI() {
    setAiSummary("🔄 Аналіз документу...");
    setError("");
    setLawRefs([]);

    try {
      const q = "Проаналізуй документ: виявити ризики, строки, невідповідності.";
      const res = await fetch("/api/ai-on-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, filename: doc.file.pdfa }),
      });
      const data = await res.json();

      if (!data.ok && data.error) {
        setError(data.error);
        setAiSummary("⚠️ Помилка аналізу.");
        return;
      }

      setAiSummary(data.answer || "Недостатньо даних у документах.");
      setLawRefs(data.laws || []);
    } catch (err: any) {
      setError(err.message);
      setAiSummary("⚠️ Сталася помилка.");
    }
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-xl border shadow-sm">
      <h2 className="text-xl font-semibold text-indigo-700">{doc.title}</h2>

      <div className="text-sm text-gray-600">
        <p><strong>Тип:</strong> {doc.type}</p>
        <p><strong>Статус:</strong> {doc.status}</p>
        <p>
          <strong>SHA256:</strong>{" "}
          {doc.versions?.[0]?.sha256?.slice(0, 16) || "—"}...
        </p>
      </div>

      <button
        onClick={runAI}
        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
      >
        ⚖️ AI-аналіз документу
      </button>

      {aiSummary && (
        <div className="p-3 rounded-lg bg-indigo-50 border text-sm whitespace-pre-wrap">
          {aiSummary}
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
          {error}
        </div>
      )}

      {lawRefs.length > 0 && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-sm">
          <h3 className="font-medium text-sky-700 mb-1">
            📘 Пов’язані статті законодавства:
          </h3>
          <ul className="list-disc ml-4">
            {lawRefs.map((l: any) => (
              <li key={l.id}>
                {l.type} {l.article ? `(${l.article})` : ""} — {l.summary}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}