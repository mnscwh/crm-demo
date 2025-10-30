// lib/rag.ts
import fs from "fs";
import path from "path";

const DOCS_DIR = path.join(process.cwd(), "data", "documents");

export function listDocFiles() {
  return fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith(".txt"));
}

export function loadDoc(filename: string) {
  const full = path.join(DOCS_DIR, filename);
  return fs.readFileSync(full, "utf-8");
}

/**
 * Объединяет все документы в один массив для ИИ
 */
export function loadAllDocs(): { filename: string; content: string }[] {
  const files = listDocFiles();
  return files.map((f) => ({ filename: f, content: loadDoc(f) }));
}

/**
 * Подготовка контекста для запроса GPT
 */
export function getContextText(question: string): string {
  const docs = loadAllDocs();
  return docs.map((d) => `Файл: ${d.filename}\n${d.content}`).join("\n\n");
}