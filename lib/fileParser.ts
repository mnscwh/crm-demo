// === FILE: lib/fileParser.ts ===
import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";

/**
 * Универсальный парсер для PDF/DOCX:
 * - Если передали абсолютный путь — читает с диска
 * - Если передали буфер — парсит из буфера
 */
export async function parseFile(
  input: string | Buffer,
  filenameHint?: string
): Promise<string> {
  try {
    const isPath = typeof input === "string";
    const buf: Buffer = isPath ? fs.readFileSync(input) : (input as Buffer);
    const ext = (
      (isPath ? path.extname(input as string) : path.extname(filenameHint || "")) || ""
    ).toLowerCase();

    if (ext === ".pdf") {
      try {
        const data = await pdf(buf);
        return (data.text || "").trim();
      } catch (e: any) {
        return `(Не вдалося прочитати PDF: ${e?.message || "unknown"})`;
      }
    }

    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer: buf });
      return (result.value || "").trim();
    }

    return "(Непідтримуваний формат)";
  } catch (err: any) {
    return `(Помилка читання файлу: ${err?.message || "unknown"})`;
  }
}

/** Безопасная нормализация относительного пути для каталога public */
export function normalizePublicPath(input: string): string {
  if (!input) return "";
  let p = input.replace(/^https?:\/\/[^/]+/i, ""); // убрать домен
  p = p.replace(/^\/?public\//i, "");              // убрать /public
  p = p.replace(/^\/+/, "");                       // убрать начальные /
  // запрет на выход выше public
  if (p.includes("..")) throw new Error("Invalid path.");
  return p;
}