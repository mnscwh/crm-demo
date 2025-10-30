import fs from "fs";
import path from "path";
import crypto from "crypto";

export const getFileHash = (filePath: string): string => {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256");
  hash.update(fileBuffer);
  return hash.digest("hex");
};

export const fileExists = (filePath: string): boolean => {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
};

export const saveJSON = (outputPath: string, data: any) => {
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`✅ Saved: ${outputPath}`);
};

// безопасный readJson — не ломает билд на edge
export const readJson = <T = any>(relativePath: string): T => {
  try {
    const absPath = path.join(process.cwd(), relativePath);
    if (!fs.existsSync(absPath))
      throw new Error(`❌ File not found: ${absPath}`);
    const data = fs.readFileSync(absPath, "utf-8");
    return JSON.parse(data) as T;
  } catch (err) {
    console.error("⚠️ readJson fallback error:", err);
    return [] as any;
  }
};

export const getDocuments = (baseDir: string): string[] => {
  const files: string[] = [];
  const walk = (dir: string) => {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) walk(fullPath);
      else if (/\.(pdf|docx)$/i.test(file)) files.push(fullPath);
    });
  };
  walk(baseDir);
  return files;
};