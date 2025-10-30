/* npx ts-node scripts/generate-demo-docs.ts */
import { Document, Packer, Paragraph, TextRun } from "docx";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const root = process.cwd();
const DOCS = path.join(root, "public", "docs");
const CONTRACTS = path.join(DOCS, "contracts");
const CLAIMS = path.join(DOCS, "claims");
const POWERS = path.join(DOCS, "powers");
const PDF_A = path.join(root, "public", "docs_pdfa");

[DOCS, CONTRACTS, CLAIMS, POWERS, PDF_A].forEach((p) => fs.mkdirSync(p, { recursive: true }));

function makeDocx(name: string, title: string, body: string) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 28 })] }),
          new Paragraph({ children: [new TextRun({ text: body, size: 24 })] }),
        ],
      },
    ],
  });
  return Packer.toBuffer(doc).then((buf) => {
    fs.writeFileSync(name, buf);
  });
}

function makePdf(name: string, title: string) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(name);
  doc.pipe(stream);
  doc.fontSize(18).text(title, { underline: true });
  doc.moveDown().fontSize(12).text("Демонстраційний PDF (не PDF/A).");
  doc.end();
  return new Promise<void>((res) => stream.on("finish", () => res()));
}

async function run() {
  const items: Array<{ folder: string; prefix: string; title: string }> = [
    { folder: CONTRACTS, prefix: "contract", title: "Договір підряду" },
    { folder: CLAIMS, prefix: "claim", title: "Позовна заява" },
    { folder: POWERS, prefix: "power", title: "Довіреність" },
  ];
  let i = 1;
  for (const it of items) {
    for (let k = 0; k < 10; k++) {
      const base = path.join(it.folder, `${it.prefix}_${i}`);
      await makeDocx(`${base}.docx`, `${it.title} №${i}`, "Обезособлений приклад документа для демо.");
      await makePdf(path.join(PDF_A, `${it.prefix}_${i}.pdf`), `${it.title} №${i}`);
      i++;
    }
  }
  console.log("✅ Згенеровано демо-документи.");
}

run();