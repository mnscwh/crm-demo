// === FILE: app/api/ai-on-docs/route.ts ===
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseFile } from "@/lib/fileParser";
import { legalChatOnDocs } from "@/lib/ai";
import { findRelevantLaw } from "@/lib/lawdb";

export const runtime = "nodejs";

/**
 * Нормалізує шлях до файлу (щоб не дублювався /public і не ламався на Vercel)
 */
function normalizePublicPath(input: string): string {
  if (!input) return "";
  let p = input.replace(/^https?:\/\/[^/]+/i, ""); // видаляємо домен
  p = p.replace(/^\/?public\//i, ""); // видаляємо /public/
  p = p.replace(/^\/+/, ""); // видаляємо початкові слеші
  return p;
}

export async function POST(req: Request) {
  try {
    const { question, filename } = await req.json();

    if (!filename) {
      return NextResponse.json(
        { ok: false, error: "No filename provided." },
        { status: 400 }
      );
    }

    // нормалізація шляху
    const relPath = normalizePublicPath(filename);
    const filePath = path.join(process.cwd(), "public", relPath);

    if (!fs.existsSync(filePath)) {
      console.error("❌ File not found:", filePath);
      return NextResponse.json(
        { ok: false, error: `File not found: ${relPath}` },
        { status: 404 }
      );
    }

    // читаємо PDF або DOCX
    const text = await parseFile(filePath);

    // якщо текст порожній
    if (!text || text.trim().length < 20) {
      console.warn("⚠️ Empty or unreadable text for:", relPath);
      return NextResponse.json({
        ok: true,
        answer: "Недостатньо даних у документах (порожній текст або скан).",
        laws: [],
      });
    }

    // 🧠 основний AI-аналіз документа (виправлено — 2 аргументи)
    const answer = await legalChatOnDocs(
      question ||
        "Проаналізуй документ: виявити ризики, строки, невідповідності.",
      text
    );

    // ⚖️ пошук релевантних норм законодавства
    const laws = findRelevantLaw(text);

    return NextResponse.json({ ok: true, answer, laws });
  } catch (err: any) {
    console.error("❌ /api/ai-on-docs error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}