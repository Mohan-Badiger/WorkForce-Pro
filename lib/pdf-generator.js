/**
 * Server-side PDF Generator for WorkForce Pro reports.
 * Emits a structured PDF stream representing tabular metrics.
 */
export function generatePDFReport(title, headers, rows, summaryMetrics = {}) {
  // Generates a simple text-based formatted PDF buffer
  const lines = [];

  // PDF Header
  lines.push('%PDF-1.4');
  lines.push('%');

  // Object 1: Catalog
  lines.push('1 0 obj');
  lines.push('<< /Type /Catalog /Pages 2 0 R >>');
  lines.push('endobj');

  // Object 2: Pages Parent
  lines.push('2 0 obj');
  lines.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  lines.push('endobj');

  // Page Content text generation
  let reportText = `${title.toUpperCase()}\n`;
  reportText += `Generated on: ${new Date().toLocaleString('en-IN')}\n`;
  reportText += `==================================================================\n\n`;

  // Summary Metrics Section
  if (Object.keys(summaryMetrics).length > 0) {
    reportText += `SUMMARY METRICS:\n`;
    for (const [key, val] of Object.entries(summaryMetrics)) {
      reportText += ` - ${key}: ${val}\n`;
    }
    reportText += `------------------------------------------------------------------\n\n`;
  }

  // Table Headers
  const columnWidths = headers.map(h => Math.max(h.length, 12));
  rows.forEach(row => {
    row.forEach((cell, idx) => {
      const cellStr = String(cell);
      if (cellStr.length > columnWidths[idx]) {
        columnWidths[idx] = cellStr.length;
      }
    });
  });

  const separator = columnWidths.map(w => '-'.repeat(w)).join(' | ');
  const headerLine = headers.map((h, i) => h.padEnd(columnWidths[i])).join(' | ');
  reportText += `${headerLine}\n${separator}\n`;

  // Table Rows
  rows.forEach(row => {
    const rowLine = row.map((cell, i) => String(cell).padEnd(columnWidths[i])).join(' | ');
    reportText += `${rowLine}\n`;
  });

  reportText += `==================================================================\n`;
  reportText += `End of Report. WorkForce Pro SaaS.\n`;

  // Escaping parentheses for PDF literal strings
  const escapedText = reportText.replace(/[()]/g, '\\$&').replace(/\n/g, '\r');

  // Object 4: Stream content holding the formatted text
  const streamContent = 
    `BT\r` +
    `/F1 10 Tf\r` +
    `12 TL\r` +
    `50 750 Td\r` +
    `(${escapedText}) Tj\r` +
    `ET`;

  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  // Object 3: Page Definition
  lines.push('3 0 obj');
  lines.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
  lines.push('endobj');

  // Object 4: Content Stream
  lines.push('4 0 obj');
  lines.push(`<< /Length ${streamLength} >>`);
  lines.push('stream');
  lines.push(streamContent);
  lines.push('endstream');
  lines.push('endobj');

  // Object 5: Font Definition (Standard Helvetica Courier Monospace for aligned columns)
  lines.push('5 0 obj');
  lines.push('<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>');
  lines.push('endobj');

  // Cross-Reference Table & Trailer
  lines.push('xref');
  lines.push('0 6');
  lines.push('0000000000 65535 f ');
  lines.push('0000000015 00000 n ');
  lines.push('0000000074 00000 n ');
  lines.push('0000000140 00000 n ');
  lines.push('0000000290 00000 n ');
  lines.push('0000000410 00000 n ');
  lines.push('trailer');
  lines.push('<< /Size 6 /Root 1 0 R >>');
  lines.push('startxref');
  lines.push('500');
  lines.push('%%EOF');

  const pdfData = lines.join('\n');
  return Buffer.from(pdfData, 'utf-8');
}
