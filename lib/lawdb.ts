import { readJson } from "@/lib/server-utils";

/** Знаходить релевантні норми закону в тексті документа */
export async function findRelevantLaw(text: string) {
  try {
    const db = readJson<any[]>("data/lawdb.json");
    const query = text.toLowerCase();

    const results = db.filter((law) =>
      query.includes(
        law.article?.toLowerCase()?.replace("ст.", "").trim() || ""
      ) ||
      query.includes(law.type?.toLowerCase() || "")
    );

    return results.slice(0, 5);
  } catch (err) {
    console.error("⚠️ [findRelevantLaw] failed:", err);
    return [];
  }
}