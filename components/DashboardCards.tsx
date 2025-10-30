"use client";
import { useEffect, useState } from "react";

const Card = ({ title, value, tone }: { title: string; value: number; tone: "neutral" | "warn" | "info" }) => {
  const toneCls =
    tone === "warn"
      ? "bg-red-50 ring-red-100"
      : tone === "info"
      ? "bg-blue-50 ring-blue-100"
      : "bg-emerald-50 ring-emerald-100";
  const valCls =
    tone === "warn" ? "text-red-700" : tone === "info" ? "text-blue-700" : "text-emerald-700";

  return (
    <div className={`rounded-xl p-4 shadow ring-1 ${toneCls}`}>
      <p className="text-sm text-gray-600">{title}</p>
      <p className={`text-3xl font-semibold mt-1 ${valCls}`}>{value}</p>
    </div>
  );
};

export function DashboardCards() {
  const [stats, setStats] = useState({ total: 0, overdue: 0, pending: 0 });

  useEffect(() => {
    fetch("/api/deadlines", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setStats(d.stats))
      .catch(() => setStats({ total: 0, overdue: 0, pending: 0 }));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card title="Всього задач" value={stats.total} tone="info" />
      <Card title="Прострочено" value={stats.overdue} tone="warn" />
      <Card title="Очікує" value={stats.pending} tone="neutral" />
    </div>
  );
}