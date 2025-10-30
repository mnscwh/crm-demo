import { readJson } from "@/lib/server-utils";
import { computeClientRisk } from "@/lib/risk";
import { RiskPill } from "@/components/RiskBadges";
import { getDocsForClient } from "@/lib/linker";

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
    const docs = getDocsForClient(cl.id);
    const risk = computeClientRisk(cl, clCases);
    return { ...cl, _risk: risk, _cases: clCases, _docs: docs };
  });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-indigo-800">Клієнти</h1>

      <div className="rounded-xl overflow-hidden border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-900">
            <tr>
              <th className="py-2 px-3 text-left">Назва</th>
              <th className="py-2 px-3 text-center">Статус</th>
              <th className="py-2 px-3 text-center">AI Score</th>
              <th className="py-2 px-3 text-center">Справ</th>
              <th className="py-2 px-3 text-center">Документи</th>
              <th className="py-2 px-3 text-center">Ризик</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t hover:bg-indigo-50">
                <td className="py-2 px-3">{c.name}</td>
                <td className="py-2 px-3 text-center">{c.status}</td>
                <td className="py-2 px-3 text-center">
                  {Math.round((c.aiScore ?? 0) * 100)}%
                </td>
                <td className="py-2 px-3 text-center">{c._cases.length}</td>
                <td className="py-2 px-3 text-center text-indigo-700">
                  {c._docs.length} 📄
                </td>
                <td className="py-2 px-3 text-center">
                  <RiskPill risk={c._risk.label} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}