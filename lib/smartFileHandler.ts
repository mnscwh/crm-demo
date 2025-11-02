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
        text = data.text;
        type = "pdf";
      } else {
        console.log("🧠 OCR fallback:", name);
        const { data: ocr } = await Tesseract.recognize(buffer, "ukr+eng");
        text = ocr.text;
        type = "pdf-scan";
      }
    } else if (["docx", "odt"].includes(ext)) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
      type = "word";
    } else if (["xlsx", "csv"].includes(ext)) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      text = JSON.stringify(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
      type = "spreadsheet";
    } else if (["json", "yaml", "yml"].includes(ext)) {
      const raw = buffer.toString("utf8");
      text = ext === "json" ? raw : JSON.stringify(yaml.load(raw), null, 2);
      type = "structured";
    } else if (["jpg", "jpeg", "tiff", "png"].includes(ext)) {
      const { data: ocr } = await Tesseract.recognize(buffer, "ukr+eng");
      text = ocr.text;
      type = "image-scan";
    } else {
      text = "(Невідомий формат)";
    }

    const meta = { id, name, ext, type, size: file.size, uploaded: new Date().toISOString(), text };
    fs.writeFileSync(path.join(UPLOAD_DIR, `${id}.json`), JSON.stringify(meta, null, 2));

    return meta;
  } catch (err: any) {
    console.error("❌ handleUpload error:", err);
    throw new Error(`Не вдалося обробити файл ${name}: ${err.message}`);
  }
}