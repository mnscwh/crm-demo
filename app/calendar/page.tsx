import { readJson } from "@/lib/server-utils";
import { computeEventRisk } from "@/lib/risk";
import { RiskPill } from "@/components/RiskBadges";

export const runtime = "nodejs";
export const dynamic = "force-static";

type Ev = {
  id: number;
  title: string;
  date: string;
  client: string;
  lawyer: string;
  location: string;
  type: string;
};

export default function CalendarPage() {
  const events = readJson<Ev[]>("data/calendar.json")
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .map((e) => ({ ...e, _risk: computeEventRisk(e) }));

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-indigo-800">Календар та дедлайни</h1>

      <div className="rounded-xl overflow-hidden border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-900">
            <tr>
              <th className="py-2 px-3 text-left">Подія</th>
              <th className="py-2 px-3">Клієнт</th>
              <th className="py-2 px-3">Юрист</th>
              <th className="py-2 px-3">Тип</th>
              <th className="py-2 px-3">Дата/час</th>
              <th className="py-2 px-3">Ризик</th>
              <th className="py-2 px-3">Локація</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="py-2 px-3">{e.title}</td>
                <td className="py-2 px-3 text-center">{e.client}</td>
                <td className="py-2 px-3 text-center">{e.lawyer}</td>
                <td className="py-2 px-3 text-center">{e.type}</td>
                <td className="py-2 px-3 text-center">
                  {new Date(e.date).toLocaleString("uk-UA")}
                </td>
                <td className="py-2 px-3 text-center">
                  <RiskPill risk={e._risk.label} />
                </td>
                <td className="py-2 px-3 text-center">{e.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Ризик подій розраховано локально (евристика демо). Джерело: /lib/risk.ts
      </p>
    </div>
  );
}