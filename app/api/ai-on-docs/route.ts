import { NextResponse } from "next/server";
import { parseFile } from "@/lib/fileParser";
import { legalChatOnDocs } from "@/lib/ai";
import { findRelevantLaw } from "@/lib/lawdb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Нормалізація шляху до PDF/DOCX файлу (прибирає public/ або домен)
 */
function normalizePublicPath(input: string): string {
  if (!input) return "";
  let p = input.replace(/^https?:\/\/[^/]+/i, "");
  p = p.replace(/^\/?public\//i, "");
  p = p.replace(/^\/+/, "");
  return p;
}

/**
 * Завантажує файл з public/ як ArrayBuffer (сумісно з Vercel)
 */
async function loadFileAsBuffer(relPath: string): Promise<ArrayBuffer> {
  const url = `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : ""}/` + relPath;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.arrayBuffer();
  } catch (err: any) {
    console.error("❌ loadFileAsBuffer error:", err.message);
    throw new Error(`Не вдалося завантажити файл: ${relPath}`);
  }
}

/**
 * Основний POST-ендпоінт AI-аналізу документа
 */
export async function POST(req: Request) {
  console.log("📥 [ai-on-docs] API викликано");

  try {
    const { question, filename } = await req.json();

    if (!filename) {
      return NextResponse.json({ ok: false, error: "No filename provided." }, { status: 400 });
    }

    // нормалізуємо шлях
    const relPath = normalizePublicPath(filename);
    console.log("📄 Аналіз файлу:", relPath);

    // зчитуємо файл як ArrayBuffer (через fetch)
    const buffer = await loadFileAsBuffer(relPath);

    // парсимо текст (PDF або DOCX)
    const text = await parseFile(buffer, relPath);
    console.log("🧾 Довжина тексту:", text?.length || 0);

    if (!text || text.trim().length < 50) {
      console.warn("⚠️ Порожній або нечитабельний документ:", relPath);
      return NextResponse.json({
        ok: true,
        answer: "Недостатньо даних у документах (порожній текст або скан).",
        laws: [],
      });
    }

    // 🧠 AI-аналіз документа
    const aiAnswer = await legalChatOnDocs(
      question || "Проаналізуй документ: виявити ризики, строки, невідповідності.",
      text
    );

    // ⚖️ релевантні норми законодавства
    const laws = await findRelevantLaw(text);

    console.log("✅ [ai-on-docs] Аналіз завершено, знайдено статей:", laws?.length || 0);
    return NextResponse.json({ ok: true, answer: aiAnswer, laws });
  } catch (err: any) {
    console.error("❌ /api/ai-on-docs error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}