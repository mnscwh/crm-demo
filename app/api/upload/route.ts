import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Файл не знайдено" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "data", "documents");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file.name), buffer);
  return NextResponse.json({ name: file.name });
}