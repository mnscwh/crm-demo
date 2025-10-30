// app/calendar/page.tsx
import { readJson } from "@/lib/server-utils"; // ✅ исправлено

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
  const events = readJson<Ev[]>("data/calendar.json").sort( // ✅ исправлен путь
    (a, b) => +new Date(a.date) - +new Date(b.date)
  );

  return (
    <div className="space-y-6">
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
              <th className="py-2 px-3">Рекомендація</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => {
              const { risk, rec } = riskAndAdvice(e);
              return (
                <tr key={e.id} className="border-t">
                  <td className="py-2 px-3">{e.title}</td>
                  <td className="py-2 px-3 text-center">{e.client}</td>
                  <td className="py-2 px-3 text-center">{e.lawyer}</td>
                  <td className="py-2 px-3 text-center">{e.type}</td>
                  <td className="py-2 px-3 text-center">
                    {new Date(e.date).toLocaleString("uk-UA")}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <RiskPill risk={risk} />
                  </td>
                  <td className="py-2 px-3 text-center text-gray-700">{rec}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl p-5 bg-white border">
        <div className="font-medium text-gray-900 mb-2">AI-аналітика дедлайнів (демо)</div>
        <p className="text-sm text-gray-700">
          Пріоритетні події: судові засідання протягом 3 днів, дедлайни підготовки документів протягом 2 днів,
          та події з ризиком «Високий».
        </p>
      </div>
    </div>
  );
}

function diffDays(date: string) {
  const d = new Date(date).getTime();
  const now = Date.now();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}
function riskAndAdvice(e: Ev) {
  const days = diffDays(e.date);
  let risk: "Низький" | "Середній" | "Високий" = "Низький";
  let rec = "Стандартна підготовка";

  if (e.type.toLowerCase().includes("засідан")) {
    if (days <= 3) {
      risk = "Високий";
      rec = "Підготувати процесуальні документи, перевірити повідомлення суду.";
    } else if (days <= 7) {
      risk = "Середній";
      rec = "Перевірити докази, узгодити позицію з клієнтом.";
    }
  } else {
    if (days <= 2) {
      risk = "Високий";
      rec = "Терміново підготувати/підписати документ.";
    } else if (days <= 5) {
      risk = "Середній";
      rec = "Контроль строків, підтвердити відповідальних.";
    }
  }

  return { risk, rec };
}
function RiskPill({ risk }: { risk: "Низький" | "Середній" | "Високий" }) {
  const map: Record<string, string> = {
    Низький: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Середній: "bg-amber-50 text-amber-700 border-amber-200",
    Високий: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return <span className={`px-2 py-1 rounded-full text-xs border ${map[risk]}`}>{risk}</span>;
}