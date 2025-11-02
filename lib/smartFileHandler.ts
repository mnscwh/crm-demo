// === FILE: lib/smartFileHandler.ts ===
import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";
import yaml from "js-yaml";
import { v4 as uuid } from "uuid";

// 📁 Куди кладемо оброблені дані локально (для зберігання метаданих)
const UPLOAD_DIR = path.join(process.cwd(), "data/docs");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * 🧠 Основна функція для обробки завантаженого файлу
 * Викликається у /api/upload
 */
export async function handleUpload(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const name = file.name;
  const ext = name.split(".").pop()?.toLowerCase() || "bin";
  const id = uuid();

  let text = "";
  let type = "unknown";

  try {
    if (ext === "pdf") {
      const data = await pdf(buffer);
      if (data.text?.trim().length > 20) {
        text = data.text.trim();
        type = "pdf";
      } else {
        console.log("🧠 OCR fallback:", name);
        const { data: ocr } = await Tesseract.recognize(buffer, "ukr+eng");
        text = ocr.text.trim();
        type = "pdf-scan";
      }
    } else if (["docx", "odt"].includes(ext)) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value.trim();
      type = "word";
    } else if (["xlsx", "csv"].includes(ext)) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      text = JSON.stringify(json, null, 2);
      type = "spreadsheet";
    } else if (["json", "yaml", "yml"].includes(ext)) {
      const raw = buffer.toString("utf8");
      text = ext === "json" ? raw : JSON.stringify(yaml.load(raw), null, 2);
      type = "structured";
    } else if (["jpg", "jpeg", "tiff", "png"].includes(ext)) {
      const { data: ocr } = await Tesseract.recognize(buffer, "ukr+eng");
      text = ocr.text.trim();
      type = "image-scan";
    } else {
      text = "(Невідомий формат)";
    }

    const meta = {
      id,
      name,
      ext,
      type,
      size: file.size,
      uploaded: new Date().toISOString(),
      text,
    };

    // локальне кешування
    fs.writeFileSync(path.join(UPLOAD_DIR, `${id}.json`), JSON.stringify(meta, null, 2));

    return meta;
  } catch (err: any) {
    console.error("❌ handleUpload error:", err);
    throw new Error(`Не вдалося обробити файл ${name}: ${err.message}`);
  }
}

/**
 * 🧩 normalizeAndParse — окремий експорт для сумісності з API
 * Використовується у /api/upload/route.ts
 */
export async function normalizeAndParse(filename: string, data: ArrayBuffer) {
  const fakeFile = new File([data], filename);
  return await handleUpload(fakeFile);
}