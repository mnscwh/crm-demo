// === FILE: scripts/ocr_scan_to_json.ts ===
import fs from "fs";
import path from "path";
import Tesseract from "tesseract.js";
import { getFileHash, getDocuments, saveJSON } from "../lib/server-utils"; // ✅ исправлено

const DOCS_DIR = path.join(process.cwd(), "public/docs_pdfa");
const OCR_DIR = path.join(process.cwd(), "public/docs_ocr");
const MANIFEST_PATH = path.join(process.cwd(), "data/doc_manifest.json");

// Переконаймося, що цільова тека існує
if (!fs.existsSync(OCR_DIR)) fs.mkdirSync(OCR_DIR, { recursive: true });

async function processDocuments() {
  const allDocs = getDocuments(DOCS_DIR);
  console.log(`🔍 Знайдено ${allDocs.length} документів для OCR.`);

  const manifest: any[] = [];

  for (const docPath of allDocs) {
    const fileName = path.basename(docPath);
    const ocrPath = path.join(OCR_DIR, `${fileName}.ocr.json`);

    console.log(`🧠 Обробка ${fileName}...`);
    const hash = getFileHash(docPath);

    try {
      if (fileName.endsWith(".pdf")) {
        const { data } = await Tesseract.recognize(docPath, "ukr+eng");
        const result = {
          file: fileName,
          text: data.text.slice(0, 5000),
          lang: (data as any).language || "ukr",
          confidence: data.confidence,
          hash,
          createdAt: new Date().toISOString(),
        };
        saveJSON(ocrPath, result);
      } else {
        const result = {
          file: fileName,
          text: "Тестовий документ DOCX. OCR не потрібен.",
          hash,
          createdAt: new Date().toISOString(),
        };
        saveJSON(ocrPath, result);
      }

      manifest.push({
        file: fileName,
        ocrFile: `/public/docs_ocr/${fileName}.ocr.json`,
        sha256: hash,
        status: "processed",
        summary: "OCR виконано, текст збережено.",
        date: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error(`❌ Помилка OCR для ${fileName}:`, err.message);
      manifest.push({
        file: fileName,
        status: "error",
        error: err.message,
      });
    }
  }

  saveJSON(MANIFEST_PATH, manifest);
  console.log("✅ OCR завершено. Маніфест створено:", MANIFEST_PATH);
}

processDocuments();