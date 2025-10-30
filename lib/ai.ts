import OpenAI from "openai";
import { readJson } from "./server-utils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_LEGAL_GUARDRAILS = `
Ви — юридичний асистент CRM української юридичної фірми.
1. Використовуйте лише документи CRM та чинне законодавство України.
2. Заборонено вигадувати статті, справи чи реквізити.
3. Усі твердження супроводжуйте посиланнями на джерела (закон або документ CRM).
4. Якщо даних немає — відповідайте: "Недостатньо даних у CRM."
5. Мова — українська.
`;

/** 🧠 Основний аналіз документів */
export async function legalChatOnDocs(question: string, docsText: string) {
  const systemPrompt = `
  Ви — юридичний аналітик CRM.
  1. Відповідайте лише на основі тексту документів.
  2. Не додавайте вигадані факти.
  3. Якщо інформації бракує — скажіть "Недостатньо даних у документах."
  4. Мова — українська.
  `;

  const prompt = `Контекст документів:\n${docsText}\n\nПитання: ${question}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  return res.choices[0].message?.content?.trim() || "Недостатньо даних у документах.";
}