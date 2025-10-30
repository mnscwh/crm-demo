import OpenAI from "openai";
import { readJson } from "./server-utils";

/** 🔐 Система захисту від галюцинацій */
export const SYSTEM_LEGAL_GUARDRAILS = `
Ви — юридичний асистент CRM української юридичної фірми.
1. Використовуйте лише документи CRM та чинне законодавство України.
2. Заборонено вигадувати статті, справи чи реквізити.
3. Усі твердження супроводжуйте посиланнями на джерела (закон або документ CRM).
4. Якщо даних немає — відповідайте: "Недостатньо даних у CRM."
5. Мова — українська.
`;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** 🧠 Основний Copilot-запит */
export async function askLegalCopilot(question: string) {
  const ctx = getCRMContext();

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_LEGAL_GUARDRAILS },
      { role: "user", content: `Контекст CRM:\n${ctx}` },
      { role: "user", content: question }
    ],
  });

  return res.choices[0].message?.content?.trim() || "Недостатньо даних.";
}

/** 🗂️ Формує короткий контекст CRM */
function getCRMContext() {
  try {
    const clients = readJson<any[]>("data/clients.json").slice(0, 5);
    const cases = readJson<any[]>("data/cases.json").slice(0, 5);
    const docs = readJson<any[]>("data/documents.json").slice(0, 5);
    const calendar = readJson<any[]>("data/calendar.json").slice(0, 5);
    return JSON.stringify({ clients, cases, docs, calendar }, null, 2);
  } catch {
    return "Контекст CRM недоступний.";
  }
}

/** 📄 AI-аналіз документів */
export async function legalChatOnDocs(question: string, docsText: string) {
  const systemPrompt = `
  Ви — юридичний аналітик CRM.
  1. Відповідайте виключно на основі наданого контексту документів.
  2. Не додавайте вигадані факти або статті.
  3. Якщо інформації немає — відповідайте: "Недостатньо даних у документах."
  4. Мова — українська.
  `;

  const prompt = `Контекст документів:\n${docsText}\n\nПитання: ${question}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  return res.choices[0].message?.content?.trim() || "Недостатньо даних у документах.";
}