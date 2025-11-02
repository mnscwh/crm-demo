import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseFile } from "@/lib/fileParser";
import { legalChatOnDocs } from "@/lib/ai";
import { findRelevantLaw } from "@/lib/lawdb";

/** 🧠 Обов’язково для Node.js середовища на Vercel */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Нормалізація шляху до файлу */
function normalizePublicPath(input: string): string {
  if (!input) return "";
  let p = input.replace(/^https?:\/\/[^/]+/i, ""); // прибрати домен
  p = p.replace(/^\/?public\//i, ""); // прибрати /public/
  p = p.replace(/^\/+/, ""); // прибрати початкові слеші
  return p;
}

/** Основний обробник POST */
export async function POST(req: Request) {
  try {
    const { question, filename } = await req.json();

    if (!filename) {
      return NextResponse.json({ ok: false, error: "No filename provided." }, { status: 400 });
    }

    const relPath = normalizePublicPath(filename);
    const filePath = path.join(process.cwd(), "public", relPath);

    if (!fs.existsSync(filePath)) {
      console.error("❌ File not found:", filePath);
      return NextResponse.json({ ok: false, error: `File not found: ${relPath}` }, { status: 404 });
    }

    // 🧾 Зчитуємо PDF або DOCX
    const text = await parseFile(filePath);
    if (!text || text.trim().length < 20) {
      console.warn("⚠️ Empty or unreadable text for:", relPath);
      return NextResponse.json({
        ok: true,
        answer: "Недостатньо даних у документах (порожній текст або скан).",
        laws: [],
      });
    }

    // 🧠 AI-аналіз документу
    const aiAnswer = await legalChatOnDocs(
      question || "Проаналізуй документ: виявити ризики, строки, невідповідності.",
      text
    );

    // ⚖️ Пошук релевантних норм
    const laws = findRelevantLaw(text);

    return NextResponse.json({ ok: true, answer: aiAnswer, laws });
  } catch (err: any) {
    console.error("❌ /api/ai-on-docs error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}