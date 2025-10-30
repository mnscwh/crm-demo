export type DocumentManifest = {
  id: string;
  title: string;
  type: string;
  clientId: number;
  caseId: number;
  status: string;
  language: string;
  tags: string[];
  lawCitations: {
    jurisdiction: string;
    law: string;
    article: string;
  }[];
  effectiveDate: string;
  versions: {
    version: string;
    createdAt: string;
    author: string;
    source: string;
    sha256: string;
    file: { docx: string; pdfa: string };
  }[];
  lastVersion: string;
};