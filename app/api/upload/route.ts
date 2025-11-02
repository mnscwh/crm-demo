// === FILE: app/api/upload/route.ts ===
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { normalizeAndParse } from "@/lib/smartFileHandler";

export const runtime = "nodejs";

// ЕДИНАЯ ТОЧКА: реестр документов в корне /data
const DB_PATH = path.join(process.cwd(), "data", "documents.json");
// Файлы кладём в /public/uploads (локально). На Vercel — временно (обсудим ниже).
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
function readDb(): any[] {
  try {
    if (!fs.existsSync(DB_PATH)) return [];
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function writeDb(rows: any[]) {
  ensureDir(path.dirname(DB_PATH));
  fs.writeFileSync(DB_PATH, JSON.stringify(rows, null, 2), "utf8");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, error: "Файл не надіслано." }, { status: 400 });
    }

    // 1) Вычисляем имя/хэш
    const arrayBuffer = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    const sha256 = crypto.createHash("sha256").update(buf).digest("hex");
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const baseName = `${sha256}.${ext}`;

    // 2) Сохраняем файл в /public/uploads
    ensureDir(UPLOAD_DIR);
    const savePath = path.join(UPLOAD_DIR, baseName);
    fs.writeFileSync(savePath, buf);

    // 3) Парсим содержимое (текст/мета)
    const parsed = await normalizeAndParse(file.name, arrayBuffer);

    // 4) Обновляем реестр в /data/documents.json
    const rows = readDb();
    const id = `doc_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const record = {
      id,
      title: file.name,
      type: parsed.type,            // "contract" | "claim" | ...
      status: "Підписано",
      file: {
        original: file.name,
        stored: `uploads/${baseName}`, // относительный к /public
        ext,
      },
      meta: {
        name: parsed.name,
        type: parsed.type,
        size: parsed.size,
        uploaded: parsed.uploaded,
      },
      extractedText: parsed.text || "", // пригодится для AI/поиска
      versions: [{ sha256, at: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    };

    rows.unshift(record);
    writeDb(rows);

    return NextResponse.json({ ok: true, doc: record });
  } catch (err: any) {
    console.error("❌ /api/upload error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Upload failed" }, { status: 500 });
  }
}