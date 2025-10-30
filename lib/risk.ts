// Локальна евристика ризиків для демо (0..1 → Низький/Середній/Високий)

export type RiskLabel = "Низький" | "Середній" | "Високий";

export function scoreToLabel(s: number): RiskLabel {
  if (s >= 0.66) return "Високий";
  if (s >= 0.33) return "Середній";
  return "Низький";
}

// Справи: вищий ризик, якщо близька дата суду або низька ймовірність успіху
export function computeCaseRisk(c: any): { score: number; label: RiskLabel } {
  let s = 0.2;

  const p = Number(c?.aiAnalysis?.successProbability ?? 0.5); // 0..1
  s += (1 - p) * 0.6;

  if (c?.courtDate) {
    const days = daysUntil(c.courtDate);
    if (days <= 2) s += 0.3;
    else if (days <= 7) s += 0.15;
  }

  // нормалізація
  s = clamp01(s);
  return { score: s, label: scoreToLabel(s) };
}

// Події календаря: суди та дедлайни найближчих днів — підвищений ризик
export function computeEventRisk(e: any): { score: number; label: RiskLabel } {
  const days = daysUntil(e?.date);
  let s = 0.15;

  const isHearing = String(e?.type ?? "").toLowerCase().includes("засідан");
  const isDeadline = String(e?.type ?? "").toLowerCase().includes("дедлайн");

  if (isHearing) {
    if (days <= 3) s += 0.6;
    else if (days <= 7) s += 0.35;
  } else if (isDeadline) {
    if (days <= 2) s += 0.6;
    else if (days <= 5) s += 0.3;
  } else {
    if (days <= 2) s += 0.25;
  }

  s = clamp01(s);
  return { score: s, label: scoreToLabel(s) };
}

// Клієнти: багато активних справ + низький “aiScore” → підвищений ризик
export function computeClientRisk(client: any, casesForClient: any[] = []) {
  const aiScore = Number(client?.aiScore ?? 0.6); // 0..1 (чим нижче, тим гірше)
  let s = 0.2 + (1 - aiScore) * 0.6;

  const active = casesForClient.length;
  if (active >= 5) s += 0.2;
  else if (active >= 3) s += 0.1;

  s = clamp01(s);
  return { score: s, label: scoreToLabel(s) };
}

export function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function daysUntil(iso: string) {
  const d = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}