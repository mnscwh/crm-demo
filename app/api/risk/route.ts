import { NextResponse } from "next/server";
import { readJson } from "@/lib/server-utils";
import { computeCaseRisk, computeClientRisk, computeEventRisk } from "@/lib/risk";

export const runtime = "nodejs";

export async function GET() {
  try {
    const clients = readJson<any[]>("data/clients.json");
    const cases = readJson<any[]>("data/cases.json");
    const events = readJson<any[]>("data/calendar.json");

    const caseRisks = cases.map((c) => ({
      id: c.id,
      title: c.title,
      risk: computeCaseRisk(c),
    }));

    const eventRisks = events.map((e) => ({
      id: e.id,
      title: e.title,
      risk: computeEventRisk(e),
    }));

    const casesByClient = new Map<number, any[]>();
    for (const c of cases) {
      const arr = casesByClient.get(c.clientId) ?? [];
      arr.push(c);
      casesByClient.set(c.clientId, arr);
    }

    const clientRisks = clients.map((cl) => {
      const clCases = casesByClient.get(cl.id) ?? [];
      return {
        id: cl.id,
        name: cl.name,
        risk: computeClientRisk(cl, clCases),
      };
    });

    const summary = {
      cases: {
        high: caseRisks.filter((r) => r.risk.label === "Високий").length,
        mid: caseRisks.filter((r) => r.risk.label === "Середній").length,
        low: caseRisks.filter((r) => r.risk.label === "Низький").length,
      },
      events: {
        high: eventRisks.filter((r) => r.risk.label === "Високий").length,
        mid: eventRisks.filter((r) => r.risk.label === "Середній").length,
        low: eventRisks.filter((r) => r.risk.label === "Низький").length,
      },
      clients: {
        high: clientRisks.filter((r) => r.risk.label === "Високий").length,
        mid: clientRisks.filter((r) => r.risk.label === "Середній").length,
        low: clientRisks.filter((r) => r.risk.label === "Низький").length,
      },
    };

    return NextResponse.json({ ok: true, summary, caseRisks, eventRisks, clientRisks });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "risk failed" }, { status: 500 });
  }
}