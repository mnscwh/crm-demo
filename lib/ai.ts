// === FILE: lib/ai.ts ===
import OpenAI from "openai";
import { readJson } from "./server-utils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** 🧠 1. Загальний Copilot-запит (для /api/ai-general) */
export async function askLegalCopilot(question: string) {
  const systemPrompt = `
  Ви — юридичний асистент CRM.
  Відповідайте на запитання українською, коротко і по суті.
  Якщо не вистачає даних — скажіть: "Недостатньо даних у CRM."
  `;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
  });

  return res.choices[0].message?.content?.trim() || "Недостатньо даних у CRM.";
}

/** 🧾 2. AI-аналіз документів (для /api/ai-on-docs) */
export async function legalChatOnDocs(question: string, docsText: string) {
  const systemPrompt = `
  Ви — юридичний аналітик.
  Відповідайте лише на основі наданого тексту документів.
  Якщо бракує даних — скажіть "Недостатньо даних у документах."
  Мова — українська.
  `;

  const prompt = `Контекст документів:\n${docsText}\n\nПитання: ${question}`;

  const r = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  return r.choices[0].message?.content?.trim() || "Недостатньо даних у документах.";
}

/** ⚖️ 3. Знаходить релевантні норми закону в тексті документа */
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