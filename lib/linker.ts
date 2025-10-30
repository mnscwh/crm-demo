import { readJson } from "@/lib/server-utils";

/**
 * Простий евристичний зв’язувач документів із справами та клієнтами.
 * Використовує схожість назв, id, та ключові слова у назвах файлів.
 */

export type LinkedDoc = {
  id: string;
  title: string;
  type: string;
  status: string;
  file: { pdfa: string };
};

export function linkDocuments() {
  const docs = readJson<LinkedDoc[]>("data/documents.json");
  const cases = readJson<any[]>("data/cases.json");
  const clients = readJson<any[]>("data/clients.json");

  const links: {
    caseId: number;
    clientId: number;
    documents: LinkedDoc[];
  }[] = [];

  for (const c of cases) {
    const relatedDocs = docs.filter((d) => {
      const title = d.title.toLowerCase();
      const cname = c.title.toLowerCase();
      return (
        title.includes(String(c.id)) ||
        title.includes(cname.split(" ")[0]) ||
        title.includes(c.category.toLowerCase())
      );
    });

    const client = clients.find((cl) => cl.id === c.clientId);
    if (relatedDocs.length > 0 && client) {
      links.push({
        caseId: c.id,
        clientId: client.id,
        documents: relatedDocs,
      });
    }
  }

  return { links, docs, cases, clients };
}

export function getDocsForCase(caseId: number) {
  const { links } = linkDocuments();
  return links.find((l) => l.caseId === caseId)?.documents ?? [];
}

export function getDocsForClient(clientId: number) {
  const { links } = linkDocuments();
  return links.filter((l) => l.clientId === clientId).flatMap((l) => l.documents);
}