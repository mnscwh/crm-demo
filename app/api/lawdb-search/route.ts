import { NextResponse } from "next/server";
import { findRelevantLaw } from "@/lib/lawdb";

export const runtime = "nodejs"; // гарантируем Node окружение

export async function POST(req: Request) {
  try {
    console.log("✅ [lawdb-search] API called");

    const { text } = await req.json();
    console.log("📥 Query text:", text);

    const results = await findRelevantLaw(text || "");
    console.log("📤 Found results:", results);

    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    console.error("❌ [lawdb-search] Error:", err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}