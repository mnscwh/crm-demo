import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";

/** 
 * Безпечний універсальний парсер DOCX/PDF
 * Повертає текст документа або fallback 
 */
export async function parseFile(filePath: string): Promise<string> {
  if (!fs.existsSync(filePath)) throw new Error(`Файл не знайдено: ${filePath}`);

  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      try {
        const data = await pdf(dataBuffer);
        return data.text || "(Порожній PDF)";
      } catch (err: any) {
        console.warn(`⚠️ PDF parse error for ${filePath}: ${err.message}`);
        return `(Не вдалося прочитати PDF: ${err.message})`;
      }
    }

    if (ext === ".docx") {
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "(Порожній DOCX)";
    }

    return "(Непідтримуваний формат)";
  } catch (err: any) {
    console.error(`❌ parseFile error for ${filePath}:`, err);
    return `(Помилка читання: ${err.message})`;
  }
}