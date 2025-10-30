import { NextResponse } from "next/server";
import { readJson } from "@/lib/server-utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { doc } = await req.json();
  if (!doc?.text) return NextResponse.json({ ok: false, error: "no text" });

  // Імітація GPT-аналізу
  const cases = readJson<any[]>("data/cases.json");
  const matches = cases.filter((c) =>
    doc.text.toLowerCase().includes(c.title.toLowerCase().split(" ")[0])
  );

  return NextResponse.json({
    ok: true,
    linkedCases: matches.map((c) => ({ id: c.id, title: c.title })),
    confidence: matches.length > 0 ? 0.8 : 0.3
  });
}