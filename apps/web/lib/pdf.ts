function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\r?\n/g, "\\n");
}

export function createSimplePdf(title: string, markdown: string) {
  const lines = [`Forks Export: ${title}`, "", ...markdown.replace(/^#+\s*/gm, "").split(/\r?\n/)].slice(0, 36);
  const textCommands = lines.map((line, index) => `BT /F1 11 Tf 54 ${760 - index * 18} Td (${escapePdfText(line)}) Tj ET`).join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${textCommands.length} >> stream\n${textCommands}\nendstream endobj`
  ];
  const header = "%PDF-1.4\n";
  let cursor = header.length;
  const offsets = objects.map((object) => {
    const offset = cursor;
    cursor += object.length + 1;
    return offset;
  });
  const body = `${objects.join("\n")}\n`;
  const xrefStart = header.length + body.length;
  const xref = [
    "xref",
    "0 6",
    "0000000000 65535 f ",
    ...offsets.map((offset) => `${offset.toString().padStart(10, "0")} 00000 n `),
    "trailer << /Size 6 /Root 1 0 R >>",
    "startxref",
    String(xrefStart),
    "%%EOF"
  ].join("\n");

  return `${header}${body}${xref}`;
}
