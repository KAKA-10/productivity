function escapePdf(text: string) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7e]/g, '?')
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
    .replaceAll('\r', '');
}

function wrap(text: string, width = 88) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

export function buildPdfDocument(
  title: string,
  lines: string[],
  confidentialityLine = 'Confidential workplace safety record',
) {
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 48;
  const lineHeight = 14;
  const contentLines = lines.flatMap((line) => wrap(line));

  const pages: string[][] = [];
  let bucket: string[] = [];
  let y = pageHeight - 110;
  for (const line of contentLines) {
    if (y < 64) {
      pages.push(bucket);
      bucket = [];
      y = pageHeight - 80;
    }
    bucket.push(line);
    y -= lineHeight;
  }
  pages.push(bucket);

  const objects: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  const pageIds: number[] = [];
  let nextId = 3;

  const fontId = 3 + pages.length * 2;
  pages.forEach(() => {
    pageIds.push(nextId);
    nextId += 2;
  });

  const kids = pageIds.map((id) => `${id} 0 R`).join(' ');
  objects.push(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);

  const streamIds: number[] = [];
  pages.forEach((pageLines, index) => {
    const pageId = pageIds[index];
    const streamId = pageId + 1;
    streamIds.push(streamId);
    objects[pageId - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${streamId} 0 R /Resources << /Font << /F1 ${fontId} 0 R /F2 ${fontId + 1} 0 R >> >> >>`;

    let stream = 'BT\n';
    stream += `/F2 11 Tf 0.11 0.26 0.20 rg ${margin} ${pageHeight - 42} Td (PRODUCTIVITY OSHAPP  |  OSHA 2007  |  DOSHS) Tj\n`;
    stream += `/F1 16 Tf 0 0 0 rg 0 -24 Td (${escapePdf(title)}) Tj\n`;
    stream += `/F1 10 Tf 0 -18 Td (${escapePdf(confidentialityLine)}) Tj\n`;
    stream += '0 g\n';
    pageLines.forEach((line, i) => {
      const xCmd = i === 0 ? `0 -28 Td` : `0 -${lineHeight} Td`;
      stream += `${xCmd} (${escapePdf(line)}) Tj\n`;
    });
    stream += 'ET';
    objects[streamId - 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  objects[fontId - 1] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  objects[fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((off) => {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

export function buildPdf(title: string, lines: string[], confidentialityLine?: string) {
  return new Blob([buildPdfDocument(title, lines, confidentialityLine)], { type: 'application/pdf' });
}

export function downloadPdf(filename: string, title: string, lines: string[], confidentialityLine?: string) {
  const blob = buildPdf(title, lines, confidentialityLine);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
