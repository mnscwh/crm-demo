// === FILE: lib/lawdb.ts ===
import { readJson } from "@/lib/server-utils";

export function findRelevantLaw(text: string) {
  try {
    const db = readJson<any[]>("data/lawdb.json");
    const q = text.toLowerCase();
    const res = db.filter((law) => {
      const art = (law.article || "").toLowerCase().replace("ст.", "").trim();
      return (art && q.includes(art)) || q.includes((law.type || "").toLowerCase());
    });
    return res.slice(0, 5);
  } catch {
    return [];
  }
}