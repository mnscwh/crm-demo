// === FILE: lib/ai.ts ===
import OpenAI from "openai";
import { readJson } from "./server-utils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const SYSTEM_LEGAL_GUARDRAILS = `
Ви — юридичний асистент CRM української юридичної фірми.
1) Використовуйте лише документи CRM та чинне законодавство України.
2) Заборонено вигадувати статті, справи, реквізити.
3) Усі твердження супроводжуйте посиланнями на джерела (закон або документ CRM).
4) Якщо даних немає — відповідайте: "Недостатньо даних у CRM/документах".
5) Мова — українська.
`;

export async function legalChatOnDocs(question: string, docsText: string) {
  const system = `
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
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });

  return r.choices[0].message?.content?.trim() || "Недостатньо даних у документах.";
}