import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseFile } from "@/lib/fileParser";
import { legalChatOnDocs } from "@/lib/ai";
import { findRelevantLaw } from "@/lib/lawdb";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { question, filename } = await req.json();
    if (!filename) {
      return NextResponse.json({ error: "No filename provided." }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    // 🔍 Зчитати текст документа (DOCX або PDF)
    const text = await parseFile(filePath);

    // 🧠 Основний AI-аналіз документа
    const answer = await legalChatOnDocs(question, text);

    // ⚖️ Знайти дотичні норми законодавства
    const laws = await findRelevantLaw(text);

    return NextResponse.json({
      ok: true,
      answer,
      laws,
    });
  } catch (err: any) {
    console.error("❌ /api/ai-on-docs error:", err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}