// === FILE: app/api/upload/route.ts ===
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { normalizeAndParse } from "@/lib/smartFileHandler";

export const runtime = "nodejs";

const DB_PATH = path.join(process.cwd(), "data", "documents.json");
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
    const blob = formData.get("file") as Blob | null;

    if (!blob)
      return NextResponse.json({ ok: false, error: "Файл не надіслано." }, { status: 400 });

    // читаем имя и расширение
    const filename =
      (blob as any).name || "uploaded_" + Date.now().toString();
    const ext = filename.split(".").pop()?.toLowerCase() || "bin";

    // читаем содержимое
    const arrayBuffer = await blob.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    const sha256 = crypto.createHash("sha256").update(buf).digest("hex");
    const baseName = `${sha256}.${ext}`;

    ensureDir(UPLOAD_DIR);
    const savePath = path.join(UPLOAD_DIR, baseName);
    fs.writeFileSync(savePath, buf);

    // парсим контент
    const parsed = await normalizeAndParse(filename, arrayBuffer);

    // обновляем базу
    const rows = readDb();
    const id = `doc_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const record = {
      id,
      title: filename,
      type: parsed.type,
      status: "Підписано",
      file: {
        original: filename,
        stored: `uploads/${baseName}`,
        ext,
      },
      meta: {
        size: buf.length,
        uploaded: new Date().toISOString(),
        type: parsed.type,
      },
      extractedText: parsed.text || "",
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