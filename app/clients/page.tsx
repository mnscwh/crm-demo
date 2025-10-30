import { readJson } from "@/lib/server-utils";
import { computeClientRisk } from "@/lib/risk";
import { RiskPill } from "@/components/RiskBadges";

export const runtime = "nodejs";
export const dynamic = "force-static";

export default function ClientsPage() {
  const clients = readJson<any[]>("data/clients.json");
  const cases = readJson<any[]>("data/cases.json");

  const byClient = new Map<number, any[]>();
  for (const c of cases) {
    const arr = byClient.get(c.clientId) ?? [];
    arr.push(c);
    byClient.set(c.clientId, arr);
  }

  const rows = clients.map((cl) => {
    const clCases = byClient.get(cl.id) ?? [];
    const risk = computeClientRisk(cl, clCases);
    return { ...cl, _risk: risk, casesCount: clCases.length };
  });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-indigo-800">Клієнти</h1>

      <div className="rounded-xl overflow-hidden border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-900">
            <tr>
              <th className="py-2 px-3 text-left">Назва</th>
              <th className="py-2 px-3 text-left">Контакт</th>
              <th className="py-2 px-3">Статус</th>
              <th className="py-2 px-3">AI Score</th>
              <th className="py-2 px-3">Справ</th>
              <th className="py-2 px-3">Юрист</th>
              <th className="py-2 px-3">Ризик</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="py-2 px-3">{c.name}</td>
                <td className="py-2 px-3">{c.contact}</td>
                <td className="py-2 px-3 text-center">
                  <span className="px-2 py-1 rounded-full text-xs bg-sky-50 text-sky-700 border border-sky-200">
                    {c.status}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">{Math.round((c.aiScore ?? 0) * 100)}%</td>
                <td className="py-2 px-3 text-center">{c.casesCount}</td>
                <td className="py-2 px-3 text-center">{c.responsibleLawyer}</td>
                <td className="py-2 px-3 text-center">
                  <RiskPill risk={c._risk.label} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Ризик клієнтів розраховано локально (евристика демо). Джерело: /lib/risk.ts
      </p>
    </div>
  );
}