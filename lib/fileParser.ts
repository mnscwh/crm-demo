import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";

/**
 * Парсер PDF/DOCX з підтримкою OCR (для сканів)
 */
export async function parseFile(input: Buffer | string, filename?: string): Promise<string> {
  try {
    const ext = (filename || "").toLowerCase();
    let buffer: Buffer;

    if (typeof input === "string") {
      const abs = path.isAbsolute(input) ? input : path.join(process.cwd(), input);
      if (!fs.existsSync(abs)) throw new Error(`Файл не знайдено: ${abs}`);
      buffer = fs.readFileSync(abs);
    } else {
      buffer = input;
    }

    // === PDF ===
    if (ext.endsWith(".pdf")) {
      // 1️⃣ спроба звичайного парсингу
      const data = await pdf(buffer);
      if (data.text && data.text.trim().length > 20) return data.text.trim();

      // 2️⃣ якщо тексту нема — OCR
      console.log("🧠 OCR fallback для сканованого PDF:", filename);
      const { data: ocr } = await Tesseract.recognize(buffer, "ukr+eng", {
        logger: (m) => console.log("OCR:", m.status, m.progress),
      });
      return ocr.text.trim();
    }

    // === DOCX ===
    if (ext.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value?.trim() || "";
    }

    return "(Непідтримуваний формат)";
  } catch (err: any) {
    console.error("❌ parseFile error:", err);
    return "";
  }
}