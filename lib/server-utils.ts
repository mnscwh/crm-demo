// === FILE: lib/server-utils.ts ===
import fs from "fs";
import path from "path";
import crypto from "crypto";

/** Обчислення SHA256 контрольної суми файлу */
export const getFileHash = (filePath: string): string => {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256");
  hash.update(fileBuffer);
  return hash.digest("hex");
};

/** Перевірка, чи існує файл */
export const fileExists = (filePath: string): boolean => {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
};

/** Запис JSON-файлу з форматуванням */
export const saveJSON = (outputPath: string, data: any) => {
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`✅ Saved: ${outputPath}`);
};

/** Читання JSON з будь-якої директорії (generic) */
export const readJson = <T = any>(relativePath: string): T => {
  const absPath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(absPath)) throw new Error(`❌ File not found: ${absPath}`);
  const data = fs.readFileSync(absPath, "utf-8");
  return JSON.parse(data) as T;
};

/** Отримання списку PDF/DOCX для обробки */
export const getDocuments = (baseDir: string): string[] => {
  const files: string[] = [];
  const walk = (dir: string) => {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (/\.(pdf|docx)$/i.test(file)) {
        files.push(fullPath);
      }
    });
  };
  walk(baseDir);
  return files;
};