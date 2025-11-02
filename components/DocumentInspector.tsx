// === FILE: components/DocumentInspector.tsx ===
"use client";
import { useState } from "react";

function normalizeFilePath(doc: any): string {
  const raw =
    doc?.file?.pdfa ||
    doc?.file?.docx ||
    doc?.filePath ||
    doc?.pdfa ||
    doc?.docx ||
    doc?.path ||
    "";

  return String(raw)
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/?public\//i, "")
    .replace(/^\/+/, "");
}

export function DocumentInspector({ doc }: { doc: any }) {
  const [aiSummary, setAiSummary] = useState<string>("");
  const [lawRefs, setLawRefs] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function runAI() {
    setAiSummary("🔄 Аналіз документу...");
    setError("");
    setLawRefs([]);
    setLoading(true);

    try {
      const filename = normalizeFilePath(doc);
      const q =
        "Проаналізуй документ: виявити ризики, строки, невідповідності, а також визначити, чи є потенційні проблеми з правовими нормами.";
      const res = await fetch("/api/ai-on-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, filename }),
      });

      const data = await res.json();
      if (!res.ok || data.ok === false) {
        setError(data.error || `HTTP ${res.status}`);
        setAiSummary("⚠️ Помилка аналізу.");
        return;
      }

      setAiSummary(data.answer || "Недостатньо даних у документах.");
      setLawRefs(data.laws || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setAiSummary("⚠️ Сталася помилка.");
    } finally {
      setLoading(false);
    }
  }

  function renderRiskTag(text: string) {
    if (/висок/i.test(text)) return <span className="text-red-600 font-semibold">🔴 Високий ризик</span>;
    if (/серед/i.test(text)) return <span className="text-amber-600 font-semibold">⚠️ Середній ризик</span>;
    if (/низ/i.test(text)) return <span className="text-green-600 font-semibold">🟢 Низький ризик</span>;
    return null;
  }

  return (
    <div className="space-y-4 p-5 bg-white rounded-xl border shadow-sm">
      <h2 className="text-xl font-semibold text-indigo-700">{doc.name || "Документ"}</h2>

      <div className="text-sm text-gray-600">
        <p>
          <strong>Тип:</strong> {doc.type || "—"}
        </p>
        <p>
          <strong>Розмір:</strong> {(doc.size / 1024).toFixed(1)} КБ
        </p>
        <p>
          <strong>Дата:</strong>{" "}
          {doc.uploaded ? new Date(doc.uploaded).toLocaleString("uk-UA") : "—"}
        </p>
      </div>

      <button
        onClick={runAI}
        disabled={loading}
        className={`px-4 py-2 text-sm rounded-lg text-white ${
          loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        ⚖️ {loading ? "Аналіз триває..." : "AI-аналіз документу"}
      </button>

      {aiSummary && (
        <div className="p-3 rounded-lg bg-indigo-50 border text-sm whitespace-pre-wrap leading-relaxed">
          {aiSummary}
          <div className="mt-2">{renderRiskTag(aiSummary)}</div>
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
          <ul className="list-disc ml-4 space-y-1">
            {lawRefs.map((l: any, i) => (
              <li key={i}>
                <span className="font-medium text-sky-800">
                  {l.type} {l.article ? `(${l.article})` : ""}
                </span>
                <span className="text-gray-700"> — {l.summary}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}