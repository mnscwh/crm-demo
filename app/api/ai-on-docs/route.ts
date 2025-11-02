import { NextResponse } from "next/server";
import { parseFile } from "@/lib/fileParser";
import { legalChatOnDocs } from "@/lib/ai";
import { findRelevantLaw } from "@/lib/lawdb";

export const runtime = "nodejs";

/**
 * AI-аналіз документів (підтримує Vercel / serverless)
 * 1️⃣ Отримує документ через fetch (без fs)
 * 2️⃣ Якщо PDF порожній — шукає OCR JSON fallback
 * 3️⃣ Повертає AI-висновок і знайдені статті
 */
export async function POST(req: Request) {
  try {
    const { question, filename } = await req.json();
    if (!filename) {
      return NextResponse.json({ ok: false, error: "Не передано шлях до файлу." }, { status: 400 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://crm-demo.vercel.app";
    const fileUrl = `${baseUrl}/${filename.replace(/^\/+/, "")}`;

    console.log("📄 Завантаження файлу:", fileUrl);
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok)
      throw new Error(`Не вдалося отримати файл (${fileRes.status})`);

    const buffer = await fileRes.arrayBuffer();
    let text = await parseFile(buffer, filename);

    // 🧾 fallback на OCR
    if (!text || text.trim().length < 50) {
      const ocrName = filename.split("/").pop()?.replace(".pdf", ".json");
      const ocrUrl = `${baseUrl}/docs_ocr/${ocrName}`;
      console.log("🧠 OCR fallback:", ocrUrl);

      try {
        const ocrRes = await fetch(ocrUrl);
        if (ocrRes.ok) {
          const ocrData = await ocrRes.json();
          text = ocrData.text || "(OCR порожній)";
        }
      } catch {
        console.warn("⚠️ OCR fallback не знайдено");
      }
    }

    // 🧠 Аналіз документу
    const answer = await legalChatOnDocs(question, text);
    const laws = await findRelevantLaw(text);

    return NextResponse.json({ ok: true, answer, laws });
  } catch (err: any) {
    console.error("❌ /api/ai-on-docs:", err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}