import { NextResponse } from "next/server";
import { linkDocuments } from "@/lib/linker";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = linkDocuments();
    return NextResponse.json({ ok: true, ...data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}