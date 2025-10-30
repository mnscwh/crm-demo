import { readJson } from "@/lib/server-utils";
import { ClientsTable } from "@/components/ClientsTable";

export const runtime = "nodejs";
export const dynamic = "force-static";

export default function ClientsPage() {
  const clients = readJson<any[]>("data/clients.json");
  return <ClientsTable clients={clients} />;
}