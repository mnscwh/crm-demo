"use client";
import { useState } from "react";

export function TableCard({
  title,
  headers,
  rows,
  aiContext,
}: {
  title: string;
  headers: string[];
  rows: any[];
  aiContext: string;
}) {
  const [aiResult, setAiResult] = useState<string>("");

  async function analyzeRow(row: any) {
    const q = `Проаналізуй ${aiContext}:\n${JSON.stringify(row, null, 2)}`;
    const r = await fetch("/api/ai-general", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
    });
    const data = await r.json();
    setAiResult(data.answer || "Недостатньо даних.");
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5 space-y-4">
      <h2 className="text-xl font-semibold text-indigo-700">{title}</h2>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-indigo-50 text-gray-700">
            {headers.map((h) => (
              <th key={h} className="p-2 text-left border-b">
                {h}
              </th>
            ))}
            <th className="p-2 text-right border-b">AI</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-indigo-50">
              {Object.values(r).slice(0, headers.length).map((v, j) => (
                <td key={j} className="p-2 border-b text-gray-800">
                  {String(v)}
                </td>
              ))}
              <td className="p-2 text-right border-b">
                <button
                  onClick={() => analyzeRow(r)}
                  className="text-indigo-600 hover:text-indigo-800 text-xs"
                >
                  🔍 Аналіз
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {aiResult && (
        <div className="p-3 bg-indigo-50 text-gray-800 rounded-lg border text-sm whitespace-pre-wrap">
          {aiResult}
        </div>
      )}
    </div>
  );
}