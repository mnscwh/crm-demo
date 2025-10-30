import { readJson } from "@/lib/server-utils";
import { CalendarTable } from "@/components/CalendarTable";

export const runtime = "nodejs";
export const dynamic = "force-static";

export default function CalendarPage() {
  const events = readJson<any[]>("data/calendar.json");
  return <CalendarTable events={events} />;
}