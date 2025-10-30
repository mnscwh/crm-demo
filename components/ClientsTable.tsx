"use client";
import { useState } from "react";

export function ClientsTable({ clients }: { clients: any[] }) {
  const [aiResult, setAiResult] = useState<string>("");

  async function analyze(client: any) {
    const q = `Проаналізуй клієнта:\n${JSON.stringify(client, null, 2)}`;
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
      <h1 className="text-2xl font-semibold text-indigo-800">Клієнти</h1>

      <div className="rounded-xl overflow-hidden border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-900">
            <tr>
              <th className="py-2 px-3 text-left">Назва</th>
              <th className="py-2 px-3 text-left">Контакт</th>
              <th className="py-2 px-3 text-center">Статус</th>
              <th className="py-2 px-3 text-center">AI Score</th>
              <th className="py-2 px-3 text-center">Справ</th>
              <th className="py-2 px-3 text-center">Юрист</th>
              <th className="py-2 px-3 text-center">AI</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t hover:bg-indigo-50">
                <td className="py-2 px-3">{c.name}</td>
                <td className="py-2 px-3">{c.contact}</td>
                <td className="py-2 px-3 text-center">{c.status}</td>
                <td className="py-2 px-3 text-center">
                  {Math.round((c.aiScore || 0) * 100)}%
                </td>
                <td className="py-2 px-3 text-center">
                  {c.activeCases?.length || 0}
                </td>
                <td className="py-2 px-3 text-center">{c.responsibleLawyer}</td>
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