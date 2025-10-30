import { readJson } from "@/lib/server-utils";
import { CasesTable } from "@/components/CasesTable";

export const runtime = "nodejs";
export const dynamic = "force-static";

export default function CasesPage() {
  const cases = readJson<any[]>("data/cases.json");
  return <CasesTable cases={cases} />;
}