"use client";

export type RiskLabel = "Низький" | "Середній" | "Високий";

export function RiskPill({ risk }: { risk: RiskLabel }) {
  const map: Record<RiskLabel, string> = {
    Низький: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Середній: "bg-amber-50 text-amber-700 border-amber-200",
    Високий: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return <span className={`px-2 py-1 rounded-full text-xs border ${map[risk]}`}>{risk}</span>;
}

export function RiskLegend() {
  return (
    <div className="flex gap-2 text-xs text-gray-600">
      <span className="inline-flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Низький
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-amber-500" /> Середній
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-rose-500" /> Високий
      </span>
    </div>
  );
}