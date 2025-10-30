// app/clients/page.tsx
import { readJson } from "@/lib/server-utils";

export const runtime = "nodejs";
export const dynamic = "force-static";

export default function ClientsPage() {
  const clients = readJson<any[]>("data/clients.json");

  return (
    <div className="space-y-6">
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
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="py-2 px-3">{c.name}</td>
                <td className="py-2 px-3">{c.contact}</td>
                <td className="py-2 px-3 text-center">
                  <span className="px-2 py-1 rounded-full text-xs bg-sky-50 text-sky-700 border border-sky-200">
                    {c.status}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">{Math.round(c.aiScore * 100)}%</td>
                <td className="py-2 px-3 text-center">{c.activeCases?.length || 0}</td>
                <td className="py-2 px-3 text-center">{c.responsibleLawyer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}