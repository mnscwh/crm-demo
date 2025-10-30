// app/api/documents/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { listDocFiles } from "@/lib/rag";

export async function GET() {
  const files = listDocFiles().sort((a, b) => a.localeCompare(b));
  return NextResponse.json({ files }, { headers: { "Cache-Control": "no-store" } });
}