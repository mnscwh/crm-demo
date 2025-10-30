// app/api/files/route.ts  (если отсутствовал)
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export async function GET() {
  const dir = path.join(process.cwd(), "data", "documents");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.(txt|md|pdf|docx)$/i.test(f)) : [];
  return NextResponse.json({ files });
}