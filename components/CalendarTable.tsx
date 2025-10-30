"use client";
import { useState } from "react";

export function CalendarTable({ events }: { events: any[] }) {
  const [aiResult, setAiResult] = useState<string>("");

  async function analyze(e: any) {
    const q = `Проаналізуй подію календаря:\n${JSON.stringify(e, null, 2)}\nПідготуй рекомендації та рівень ризику.`;
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
      <h1 className="text-2xl font-semibold text-indigo-800">Календар подій</h1>

      <div className="rounded-xl overflow-hidden border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-900">
            <tr>
              <th className="py-2 px-3 text-left">Подія</th>
              <th className="py-2 px-3 text-center">Клієнт</th>
              <th className="py-2 px-3 text-center">Юрист</th>
              <th className="py-2 px-3 text-center">Тип</th>
              <th className="py-2 px-3 text-center">Дата/час</th>
              <th className="py-2 px-3 text-center">AI</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t hover:bg-indigo-50">
                <td className="py-2 px-3">{e.title}</td>
                <td className="py-2 px-3 text-center">{e.client}</td>
                <td className="py-2 px-3 text-center">{e.lawyer}</td>
                <td className="py-2 px-3 text-center">{e.type}</td>
                <td className="py-2 px-3 text-center">
                  {new Date(e.date).toLocaleString("uk-UA")}
                </td>
                <td className="py-2 px-3 text-center">
                  <button
                    onClick={() => analyze(e)}
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