// === FILE: app/api/ai-on-docs/route.ts ===
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { parseFile, normalizePublicPath } from "@/lib/fileParser";
import { legalChatOnDocs } from "@/lib/ai";
import { findRelevantLaw } from "@/lib/lawdb";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { question, filename } = await req.json();

    if (!filename) {
      return NextResponse.json(
        { ok: false, error: "No filename provided." },
        { status: 400 }
      );
    }

    // 1) нормализуем относительный путь внутри public/
    let rel = normalizePublicPath(filename); // например: docs_pdfa/claim_11.pdf
    const abs = path.join(process.cwd(), "public", rel);

    // 2) проверяем наличие файла и читаем С ДИСКА (никакого HTTP)
    if (!fs.existsSync(abs)) {
      return NextResponse.json(
        { ok: false, error: `File not found: ${rel}` },
        { status: 404 }
      );
    }

    const text = await parseFile(abs);

    // 3) если парсер ничего не достал — честно говорим, что это скан/пусто
    if (!text || text.trim().length < 20 || text.startsWith("(Не вдалося")) {
      return NextResponse.json({
        ok: true,
        answer:
          "Недостатньо даних у документах (ймовірно скан або порожній PDF). Додайте OCR або завантажте DOCX.",
        laws: [],
      });
    }

    // 4) AI на тексте
    const q =
      question ||
      "Проаналізуй документ: виявити ризики, строки, невідповідності (українською).";
    const answer = await legalChatOnDocs(q, text);

    // 5) находим релевантні норми (простий матч)
    const laws = await findRelevantLaw(text);

    return NextResponse.json({ ok: true, answer, laws });
  } catch (err: any) {
    console.error("❌ /api/ai-on-docs error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}