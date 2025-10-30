// === FILE: scripts/generate-doc-manifest.ts ===
import fs from "fs";
import path from "path";
import crypto from "crypto";

const DOCS_ROOT = path.join(process.cwd(), "public/docs");
const PDF_ROOT = path.join(process.cwd(), "public/docs_pdfa");
const OUT_PATH = path.join(process.cwd(), "public/data/doc_manifest.json");

type ManifestEntry = {
  id: string;
  title: string;
  type: "contract" | "claim" | "power";
  status: "draft" | "signed" | "archived";
  clientId: number;
  caseId: number;
  language: string;
  tags: string[];
  versions: {
    version: string;
    createdAt: string;
    author: string;
    source: string;
    sha256: string;
    file: {
      docx: string;
      pdfa: string;
    };
  }[];
  lastVersion: string;
};

function sha256(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function listFiles(dir: string, type: "contract" | "claim" | "power"): ManifestEntry[] {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".docx"));
  return files.map((f, idx) => {
    const base = f.replace(".docx", "");
    const pdfPath = path.join(PDF_ROOT, `${base}.pdf`);
    const pdfExists = fs.existsSync(pdfPath);
    const id = crypto.randomUUID();

    return {
      id,
      title:
        type === "contract"
          ? `Договір №${idx + 1}`
          : type === "claim"
          ? `Позов №${idx + 1}`
          : `Довіреність №${idx + 1}`,
      type,
      status: "signed",
      clientId: (idx % 10) + 1,
      caseId: (idx % 15) + 1,
      language: "uk",
      tags: [type, "юридичний документ"],
      versions: [
        {
          version: "1.0.0",
          createdAt: new Date().toISOString(),
          author: "system@lawcrm.ai",
          source: "generated",
          sha256: pdfExists ? sha256(pdfPath) : sha256(path.join(dir, f)),
          file: {
            docx: `/public/docs/${type}s/${f}`,
            pdfa: pdfExists ? `/public/docs_pdfa/${base}.pdf` : "N/A",
          },
        },
      ],
      lastVersion: "1.0.0",
    };
  });
}

async function main() {
  console.log("🧾 Генеруємо маніфест документів...");

  const contracts = listFiles(path.join(DOCS_ROOT, "contracts"), "contract");
  const claims = listFiles(path.join(DOCS_ROOT, "claims"), "claim");
  const powers = listFiles(path.join(DOCS_ROOT, "powers"), "power");

  const manifest = [...contracts, ...claims, ...powers];

  fs.writeFileSync(OUT_PATH, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`✅ Маніфест створено: ${OUT_PATH}`);
  console.log(`📚 Усього документів: ${manifest.length}`);
}

main();