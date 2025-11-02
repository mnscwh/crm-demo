import { NextResponse } from "next/server";
import { handleUpload } from "@/lib/smartFileHandler";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data/documents.json");

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // анализ файла
    const saved = await handleUpload(file);

    // сохранить метаданные в documents.json
    let docs = [];
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf8");
      docs = raw ? JSON.parse(raw) : [];
    }

    docs.unshift(saved);
    fs.writeFileSync(DB_PATH, JSON.stringify(docs, null, 2));

    return NextResponse.json({ ok: true, ...saved });
  } catch (err: any) {
    console.error("❌ upload error:", err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}