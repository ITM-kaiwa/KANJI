/**
 * All three "download" buttons in Settings produce a printable HTML
 * document and hand off to the browser's native print dialog ("Save as
 * PDF"), instead of building a PDF client-side.
 *
 * Why: rendering kanji glyphs into a PDF requires an embedded CJK font
 * (jsPDF's built-in fonts have no Japanese glyphs at all), which means
 * shipping a multi-MB font file. The browser already has full Japanese
 * font support, so printing an HTML page gets correct, crisp kanji
 * rendering for free and lets the user's OS print dialog handle paper
 * size / margins / "Save as PDF" directly.
 */
export function openPrintWindow(title: string, bodyHtml: string) {
  const printWindow = window.open("", "_blank", "width=900,height=1200");
  if (!printWindow) {
    alert("Trình duyệt đã chặn cửa sổ in. Vui lòng cho phép pop-up để tải xuống.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;700&family=Noto+Sans+JP:wght@400;500&display=swap" rel="stylesheet" />
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Noto Sans JP", "Times New Roman", serif;
    color: #3f2a18;
    margin: 0;
    padding: 0;
  }
  .doc-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 4mm 0;
    color: #6b4226;
  }
  .doc-subtitle {
    font-size: 11px;
    color: #8c6d3f;
    margin: 0 0 8mm 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  th, td {
    border: 1px solid #d8c49f;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #f6f0e4;
    color: #6b4226;
  }
  .kanji-cell {
    font-family: "Noto Serif JP", serif;
    font-size: 28px;
    text-align: center;
  }
  .grid-page {
    display: grid;
    gap: 3mm;
  }
  .grid-cell {
    border: 1px solid #c9b183;
    position: relative;
    aspect-ratio: 1 / 1;
  }
  .grid-cell::before, .grid-cell::after {
    content: "";
    position: absolute;
    background: #e6d9bc;
  }
  .grid-cell::before { left: 50%; top: 0; bottom: 0; width: 1px; }
  .grid-cell::after { top: 50%; left: 0; right: 0; height: 1px; }
  .practice-row {
    display: flex;
    align-items: stretch;
    gap: 3mm;
    margin-bottom: 3mm;
    page-break-inside: avoid;
  }
  .practice-guide {
    flex: 0 0 auto;
    width: 18mm;
    height: 18mm;
    border: 2px solid #8c6d3f;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Noto Serif JP", serif;
    font-size: 26px;
    color: #6b4226;
    background: #fdfae2;
  }
  .practice-guide-info {
    flex: 0 0 auto;
    width: 32mm;
    font-size: 10px;
    line-height: 1.5;
    padding: 1mm 2mm;
  }
  .practice-cell {
    flex: 1 1 auto;
    border: 1px solid #c9b183;
    position: relative;
  }
  .practice-cell::before {
    content: "";
    position: absolute;
    left: 0; right: 0; top: 50%;
    border-top: 1px dashed #d8c49f;
  }
  @media print {
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
${bodyHtml}
<script>
  window.onload = function () {
    setTimeout(function () { window.print(); }, 200);
  };
</script>
</body>
</html>`);
  printWindow.document.close();
}
