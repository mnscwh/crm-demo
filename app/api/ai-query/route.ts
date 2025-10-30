// app/api/ai-query/route.ts
import { NextResponse } from "next/server";
import { legalChatOnDocs } from "@/lib/ai";
import fs from "fs";
import path from "path";
import { parseFile } from "@/lib/fileParser";

export async function POST(req: Request) {
  const { question, filename } = await req.json();

  const dir = path.join(process.cwd(), "data", "documents");
  const fullPath = path.join(dir, filename);

  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: "Файл не знайдено." }, { status: 404 });
  }

  const fileText = await parseFile(fullPath);
  const answer = await legalChatOnDocs(question, fileText);

  return NextResponse.json({ answer });
}