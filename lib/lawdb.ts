import { readJson } from "@/lib/server-utils";

export function findRelevantLaw(text: string) {
  const db = readJson<any[]>("data/lawdb.json");
  const q = text.toLowerCase();
  return db.filter((law) =>
    law.summary.toLowerCase().split(" ").some((word: string) => q.includes(word))
  );
}