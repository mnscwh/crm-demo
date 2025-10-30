// app/api/ai-analyze/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { loadDoc } from "@/lib/rag";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }
    const body = await req.json().catch(() => null);
    const filename = body?.filename as string | undefined;
    if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });

    const content = loadDoc(filename);
    let result = "Невизначений тип документа.";
    if (/договір/i.test(content)) result = "Документ: договір. Перевірити сторони, предмет, ціну, строки, відповідальність.";
    else if (/рахунок/i.test(content)) result = "Документ: рахунок-фактура. Перевірити суми, реквізити, строк оплати.";
    else if (/акт/i.test(content)) result = "Документ: акт виконаних робіт. Звірити обсяги, дати, підписи.";

    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "internal error" }, { status: 500 });
  }
}