// === FILE: lib/smartFileHandler.ts ===
import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";
import yaml from "js-yaml";
import { v4 as uuid } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "data/docs");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * 🧠 Основна функція для обробки завантаженого файлу
 */
export async function handleUpload(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return await normalizeAndParse(file.name, arrayBuffer);
}

/**
 * 🧩 normalizeAndParse — універсальна функція для парсингу будь-якого формату
 * Використовується у /api/upload
 */
export async function normalizeAndParse(filename: string, data: ArrayBuffer) {
  const buffer = Buffer.from(data);
  const ext = filename.split(".").pop()?.toLowerCase() || "bin";
  const id = uuid();

  let text = "";
  let type = "unknown";

  try {
    if (ext === "pdf") {
      const parsed = await pdf(buffer);
      if (parsed.text?.trim().length > 20) {
        text = parsed.text.trim();
        type = "pdf";
      } else {
        console.log("🧠 OCR fallback:", filename);
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
      name: filename,
      ext,
      type,
      size: buffer.length,
      uploaded: new Date().toISOString(),
      text,
    };

    fs.writeFileSync(path.join(UPLOAD_DIR, `${id}.json`), JSON.stringify(meta, null, 2));
    return meta;
  } catch (err: any) {
    console.error("❌ normalizeAndParse error:", err);
    return {
      id,
      name: filename,
      ext,
      type: "error",
      size: buffer.length,
      uploaded: new Date().toISOString(),
      text: "",
    };
  }
}