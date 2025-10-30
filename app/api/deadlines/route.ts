import { NextResponse } from "next/server";
import { readJson, saveJSON } from "@/lib/server-utils";

const FILE = "data/calendar.json";

export async function GET() {
  try {
    const data = readJson<any[]>(FILE);
    return NextResponse.json({ ok: true, data });
  } catch {
    // fallback, якщо календар порожній
    return NextResponse.json({
      ok: true,
      data: [
        {
          id: 1,
          title: "Судове засідання у справі №124/2024",
          date: "2025-11-05T10:00:00",
          client: "ТОВ Альфа",
          lawyer: "Іваненко О.",
          location: "Господарський суд м. Києва",
          type: "Засідання",
        },
      ],
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = readJson<any[]>(FILE);
    data.push({ ...body, id: Date.now() });
    saveJSON(FILE, data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Помилка запису." }, { status: 500 });
  }
}