import { NextResponse } from "next/server";
import { legalChatOnDocs } from "@/lib/ai";
import fs from "fs";
import path from "path";
import { parseFile } from "@/lib/fileParser";

export async function POST(req: Request) {
  const { question, files } = await req.json();
  const dir = path.join(process.cwd(), "data", "documents");

  const selected = Array.isArray(files) ? files : [];
  const texts: string[] = [];
  for (const f of selected) {
    const full = path.join(dir, f);
    if (fs.existsSync(full)) {
      texts.push(`${f}:\n${await parseFile(full)}`);
    }
  }
  const context = texts.join("\n\n");
  const answer = await legalChatOnDocs(question, context);
  return NextResponse.json({ answer });
}