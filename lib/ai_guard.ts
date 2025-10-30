// === FILE: lib/ai_guard.ts ===
export function validateAIResponse(text: string): string {
  if (!text || text.length < 10) return "Недостатньо даних.";
  if (/вигад|fiction|mock/i.test(text)) return "⚠️ Може містити невалідні дані.";
  if (!/[а-яіїєґ]/i.test(text)) return "⚠️ Некоректна мова або формат відповіді.";
  return text;
}