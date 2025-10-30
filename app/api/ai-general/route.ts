import { NextResponse } from "next/server";
import { askLegalCopilot } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    const answer = await askLegalCopilot(question);
    return NextResponse.json({ answer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Помилка AI-запиту." }, { status: 500 });
  }
}