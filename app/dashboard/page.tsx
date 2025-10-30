import { readJson } from "@/lib/server-utils";
import { pct } from "@/lib/utils";
import { AICopilot } from "@/components/AICopilot";
import React from "react";

export const runtime = "nodejs";
export const dynamic = "force-static";

export default function DashboardPage() {
  const clients = readJson<any[]>("data/clients.json");
  const cases = readJson<any[]>("data/cases.json");
  const docs = readJson<any[]>("data/documents.json");
  const calendar = readJson<any[]>("data/calendar.json");

  const totalClients = clients.length;
  const totalCases = cases.length;
  const highRisk = cases.filter((c) => c.aiAnalysis?.riskLevel === "Високий").length;
  const upcoming = calendar.filter((e) => new Date(e.date) > new Date()).length;

  return (
    <>
      <AICopilot />
      <div className="space-y-6 pr-10">
        <h1 className="text-2xl font-semibold text-indigo-800">Дашборд</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPI title="Клієнти" value={totalClients} sub="активних" />
          <KPI title="Справи" value={totalCases} sub="усього" />
          <KPI title="Високий ризик" value={highRisk} sub="справ" tone="red" />
          <KPI title="Найближчі події" value={upcoming} sub="календар" tone="sky" />
        </div>

        <AIInsightCard />
      </div>
    </>
  );
}

function KPI({
  title,
  value,
  sub,
  tone = "indigo",
}: {
  title: string;
  value: number | string;
  sub?: string;
  tone?: "indigo" | "red" | "sky" | "emerald";
}) {
  const toneMap: Record<string, string> = {
    indigo: "from-indigo-50 to-white",
    red: "from-rose-50 to-white",
    sky: "from-sky-50 to-white",
    emerald: "from-emerald-50 to-white",
  };
  return (
    <div className={`rounded-xl p-5 bg-gradient-to-b ${toneMap[tone]} border`}>
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-3xl font-semibold mt-1">{value}</div>
      {sub && <div className="text-gray-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}

function AIInsightCard() {
  return (
    <div className="rounded-xl p-6 bg-white border shadow-sm">
      <div className="font-medium text-gray-900 mb-2">
        🤖 AI-аналітика (демо)
      </div>
      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
        <li>Ризикові справи — підготувати докази та оновити довіреності.</li>
        <li>Документи без підпису — надіслати клієнтам на верифікацію.</li>
        <li>Календар перевищує 7 подій — оптимізуйте навантаження юристів.</li>
      </ul>
    </div>
  );
}