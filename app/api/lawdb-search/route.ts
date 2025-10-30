import { NextResponse } from "next/server";
import { findRelevantLaw } from "@/lib/lawdb";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { text } = await req.json();
  const results = findRelevantLaw(text || "");
  return NextResponse.json({ ok: true, results });
}