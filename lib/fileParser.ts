import pdf from "pdf-parse";
import mammoth from "mammoth";

/**
 * Безпечний універсальний парсер DOCX/PDF
 * Працює як із FilePath (локально), так і з ArrayBuffer (через fetch)
 */
export async function parseFile(
  input: ArrayBuffer | string,
  filename?: string
): Promise<string> {
  try {
    const ext = (filename || "").toLowerCase();

    // 🧾 PDF (ArrayBuffer)
    if (ext.endsWith(".pdf")) {
      const dataBuffer =
        typeof input === "string" ? Buffer.from(input) : Buffer.from(input);
      const data = await pdf(dataBuffer);
      return data.text?.trim() || "";
    }

    // 📄 DOCX (ArrayBuffer)
    if (ext.endsWith(".docx")) {
      const buffer =
        typeof input === "string" ? Buffer.from(input) : Buffer.from(input);
      const result = await mammoth.extractRawText({ buffer });
      return result.value?.trim() || "";
    }

    return "(Непідтримуваний формат файлу)";
  } catch (err: any) {
    console.error(`❌ parseFile error: ${err.message}`);
    return "";
  }
}