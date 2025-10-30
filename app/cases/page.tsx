// app/cases/page.tsx
import { readJson } from "@/lib/server-utils"; 

export const runtime = "nodejs";
export const dynamic = "force-static";

export default function CasesPage() {
  const cases = readJson<any[]>("data/cases.json");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-indigo-800">Справи</h1>

      <div className="rounded-xl overflow-hidden border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-900">
            <tr>
              <th className="py-2 px-3 text-left">Назва</th>
              <th className="py-2 px-3">Категорія</th>
              <th className="py-2 px-3">Статус</th>
              <th className="py-2 px-3">Ймовірність</th>
              <th className="py-2 px-3">Ризик</th>
              <th className="py-2 px-3">Дата суду</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="border-t">
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
                  {c.courtDate ? new Date(c.courtDate).toLocaleDateString("uk-UA") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}