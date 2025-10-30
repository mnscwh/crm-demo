// === FILE: scripts/ocr_scan_to_json.ts ===
import fs from "fs";
import path from "path";
import { getFileHash, getDocuments, saveJSON } from "../lib/server-utils";

const DOCS_DIR = path.join(process.cwd(), "public/docs_pdfa");
const OCR_DIR = path.join(process.cwd(), "public/docs_ocr");
const MANIFEST_PATH = path.join(process.cwd(), "public/data/doc_manifest.json");

// === Функція-заглушка OCR ===
// (на наступних етапах сюди можна буде інтегрувати реальний Tesseract або OpenAI Vision)
function fakeOCRText(file: string): string {
  const base = file.toLowerCase();
  if (base.includes("contract"))
    return `Це договір між сторонами щодо виконання робіт. Містить умови оплати, відповідальність та строки.`;
  if (base.includes("claim"))
    return `Це позовна заява до суду щодо стягнення заборгованості або порушення умов договору.`;
  if (base.includes("power"))
    return `Це довіреність на представництво інтересів клієнта у суді або державних органах.`;
  return `Тестовий OCR-текст для документа ${file}.`;
}

// === Генерація OCR-текстів та оновлення маніфесту ===
function generateOCR() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`❌ Папка не знайдена: ${DOCS_DIR}`);
    return;
  }
  if (!fs.existsSync(OCR_DIR)) fs.mkdirSync(OCR_DIR, { recursive: true });

  const pdfFiles = getDocuments(DOCS_DIR);
  const manifest: any[] = [];

  pdfFiles.forEach((file) => {
    const filename = path.basename(file);
    const hash = getFileHash(file);
    const text = fakeOCRText(filename);

    const jsonData = {
      file: filename,
      text,
      sha256: hash,
      createdAt: new Date().toISOString(),
    };

    // Зберігаємо OCR JSON
    const ocrPath = path.join(OCR_DIR, filename.replace(".pdf", ".json"));
    saveJSON(ocrPath, jsonData);

    // Додаємо у маніфест
    manifest.push({
      id: hash.slice(0, 8),
      title: `Документ ${filename}`,
      type: filename.includes("contract")
        ? "Договір"
        : filename.includes("claim")
        ? "Позовна заява"
        : filename.includes("power")
        ? "Довіреність"
        : "Документ",
      status: "Підписано",
      file: {
        original: `/docs/${filename.replace(".pdf", ".docx")}`,
        pdfa: `/docs_pdfa/${filename}`,
      },
      versions: [{ sha256: hash, path: ocrPath }],
    });
  });

  // Зберігаємо маніфест
  saveJSON(MANIFEST_PATH, manifest);
  console.log(`✅ OCR JSON створено для ${pdfFiles.length} файлів`);
  console.log(`✅ Маніфест оновлено: ${MANIFEST_PATH}`);
}

generateOCR();