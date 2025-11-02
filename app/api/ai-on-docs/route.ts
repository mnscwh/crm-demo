import { NextResponse } from "next/server";
import { parseFile } from "@/lib/fileParser";
import { legalChatOnDocs, findRelevantLaw } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { question, filename } = await req.json();
    if (!filename)
      return NextResponse.json({ ok: false, error: "No filename provided." }, { status: 400 });

    // 🔗 Абсолютний URL до public-файлу
    const base =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
    const fileUrl = `${base}/${filename.replace(/^\/+/, "")}`;

    // 📥 Скачати файл через HTTP
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`Не вдалося завантажити файл: ${filename}`);

    const arrayBuffer = await res.arrayBuffer();
    const text = await parseFile(Buffer.from(arrayBuffer), filename);

    if (!text || text.trim().length < 20) {
      return NextResponse.json({
        ok: true,
        answer: "Недостатньо даних у документах (ймовірно скан або порожній PDF).",
        laws: [],
      });
    }

    const q =
      question ||
      "Проаналізуй документ: виявити ризики, строки, невідповідності.";
    const answer = await legalChatOnDocs(q, text);
    const laws = await findRelevantLaw(text);

    return NextResponse.json({ ok: true, answer, laws });
  } catch (err: any) {
    console.error("❌ /api/ai-on-docs error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}