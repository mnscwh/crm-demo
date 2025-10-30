// app/api/stats/route.ts  (реальная подвязка графиков к документам)
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseFile } from "../../../lib/fileParser";

export const dynamic = "force-dynamic";

function monthName(d: Date) {
  return d.toLocaleDateString("uk-UA", { month: "short" });
}
export async function GET() {
  const dir = path.join(process.cwd(), "data", "documents");
  const names = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.(txt|md|pdf|docx)$/i.test(f)) : [];

  // classify + build stats
  const byType: Record<string, number> = {};
  const byMonth: Record<string, { docs: number; ai: number }> = {};
  let overdue = 0, pending = 0, done = 0;

  for (const n of names) {
    const full = path.join(dir, n);
    const stat = fs.statSync(full);
    const m = monthName(stat.mtime);
    byMonth[m] ??= { docs: 0, ai: 0 };
    byMonth[m].docs++;

    const text = await parseFile(full);
    const lower = text.toLowerCase();

    // type
    const t = /догов|contract/.test(lower) ? "Договір"
      : /рахунок|invoice/.test(lower) ? "Рахунок"
      : /акт/.test(lower) ? "Акт"
      : /додаток|специфікац/.test(lower) ? "Додаток"
      : "Інше";
    byType[t] = (byType[t] || 0) + 1;

    // status heuristics
    if (/простроч|прострочено|late/.test(lower)) overdue++;
    else if (/підписано|виконано|completed/.test(lower)) { done++; byMonth[m].ai++; }
    else pending++;
  }

  const kpi = { total: names.length, overdue, pending };
  const doneShare = [done, pending, overdue];

  const byTypeArr = Object.entries(byType).map(([name, value]) => ({ name, value }));
  const monthsOrder = ["січ.", "лют.", "бер.", "квіт.", "трав.", "черв.", "лип.", "серп.", "вер.", "жовт.", "лист.", "груд."];
  const byMonthArr = monthsOrder
    .map(m => ({ month: m, docs: byMonth[m]?.docs || 0, ai: byMonth[m]?.ai || 0 }))
    .filter(x => x.docs + x.ai > 0);

  return NextResponse.json({ kpi, byType: byTypeArr, byMonth: byMonthArr, doneShare });
}