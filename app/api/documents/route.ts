import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data/documents.json");

export async function GET() {
  try {
    if (!fs.existsSync(DB_PATH)) return NextResponse.json([]);
    const data = fs.readFileSync(DB_PATH, "utf8");
    const docs = data ? JSON.parse(data) : [];
    return NextResponse.json(docs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}