"use client";
import { useState } from "react";

export function CasesTable({ cases }: { cases: any[] }) {
  const [aiResult, setAiResult] = useState<string>("");

  async function analyze(c: any) {
    const q = `Проаналізуй судову справу:\n${JSON.stringify(c, null, 2)}\nОпиши ризики, сильні сторони та можливі дії.`;
    const r = await fetch("/api/ai-general", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
    });
    const d = await r.json();
    setAiResult(d.answer || "Недостатньо даних.");
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-indigo-800">Справи</h1>

      <div className="rounded-xl overflow-hidden border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-900">
            <tr>
              <th className="py-2 px-3 text-left">Назва</th>
              <th className="py-2 px-3 text-center">Категорія</th>
              <th className="py-2 px-3 text-center">Статус</th>
              <th className="py-2 px-3 text-center">Ймовірність</th>
              <th className="py-2 px-3 text-center">Ризик</th>
              <th className="py-2 px-3 text-center">Дата суду</th>
              <th className="py-2 px-3 text-center">AI</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="border-t hover:bg-indigo-50">
                <td className="py-2 px-3">{c.title}</td>
                <td className="py-2 px-3 text-center">{c.category}</td>
                <td className="py-2 px-3 text-center">{c.status}</td>
                <td className="py-2 px-3 text-center">
                  {Math.round((c.aiAnalysis?.successProbability || 0) * 100)}%
                </td>
                <td className="py-2 px-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs border ${
                      c.aiAnalysis?.riskLevel === "Високий"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : c.aiAnalysis?.riskLevel === "Середній"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {c.aiAnalysis?.riskLevel || "—"}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  {c.courtDate
                    ? new Date(c.courtDate).toLocaleDateString("uk-UA")
                    : "—"}
                </td>
                <td className="py-2 px-3 text-center">
                  <button
                    onClick={() => analyze(c)}
                    className="text-indigo-600 hover:text-indigo-800 text-xs"
                  >
                    🔍 Аналіз
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {aiResult && (
        <div className="p-3 rounded-lg bg-indigo-50 text-gray-800 border text-sm whitespace-pre-wrap">
          {aiResult}
        </div>
      )}
    </div>
  );
}