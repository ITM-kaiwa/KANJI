import { openPrintWindow } from "./printWindow";

/** "Giấy kẻ ô" -- blank kanji-practice grid paper (genkouyoushi-style squares
 * with cross guides), independent of any specific kanji list. */
export function downloadRuledPaper(columns = 10, rows = 14) {
  const cells = Array.from({ length: columns * rows })
    .map(() => `<div class="grid-cell"></div>`)
    .join("");

  const body = `
    <div class="doc-title">Giấy kẻ ô luyện viết chữ Hán</div>
    <div class="doc-subtitle">Kanji Học Tập App &middot; ${columns} x ${rows} ô vuông (có gạch chữ thập canh giữa)</div>
    <div class="grid-page" style="grid-template-columns: repeat(${columns}, 1fr);">
      ${cells}
    </div>
  `;

  openPrintWindow("Giấy kẻ ô luyện viết", body);
}
