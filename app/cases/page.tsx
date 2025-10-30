import { readJson } from "@/lib/server-utils";
import { computeCaseRisk } from "@/lib/risk";
import { RiskPill } from "@/components/RiskBadges";
import { getDocsForCase } from "@/lib/linker";

export const runtime = "nodejs";
export const dynamic = "force-static";

export default function CasesPage() {
  const cases = readJson<any[]>("data/cases.json").map((c) => ({
    ...c,
    _risk: computeCaseRisk(c),
    _docs: getDocsForCase(c.id),
  }));

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-indigo-800">Справи</h1>

      <div className="rounded-xl overflow-hidden border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-900">
            <tr>
              <th className="py-2 px-3 text-left">Назва</th>
              <th className="py-2 px-3 text-center">Категорія</th>
              <th className="py-2 px-3 text-center">Статус</th>
              <th className="py-2 px-3 text-center">Документи</th>
              <th className="py-2 px-3 text-center">Ризик</th>
              <th className="py-2 px-3 text-center">Дата суду</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="border-t hover:bg-indigo-50">
                <td className="py-2 px-3">{c.title}</td>
                <td className="py-2 px-3 text-center">{c.category}</td>
                <td className="py-2 px-3 text-center">{c.status}</td>
                <td className="py-2 px-3 text-center text-indigo-700">
                  {c._docs.length} 📄
                </td>
                <td className="py-2 px-3 text-center">
                  <RiskPill risk={c._risk.label} />
                </td>
                <td className="py-2 px-3 text-center">
                  {c.courtDate
                    ? new Date(c.courtDate).toLocaleDateString("uk-UA")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}