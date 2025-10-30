import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function parseFile(filePath: string): Promise<string> {
  const ext = filePath.split(".").pop()?.toLowerCase();
  if (!ext) return "";

  if (ext === "txt" || ext === "md") return fs.readFileSync(filePath, "utf8");

  if (ext === "pdf") {
    const data = await pdf(fs.readFileSync(filePath));
    return data.text;
  }

  if (ext === "docx") {
    const res = await mammoth.extractRawText({ path: filePath });
    return res.value;
  }

  return "";
}