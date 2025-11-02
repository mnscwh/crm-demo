import { NextResponse } from "next/server";
import { handleUpload } from "@/lib/smartFileHandler";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const saved = await handleUpload(file);
    return NextResponse.json({ ok: true, ...saved });
  } catch (err: any) {
    console.error("❌ upload error:", err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}