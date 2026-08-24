import { isNoReading, type KanjiEntry } from "@/lib/types";
import { openPrintWindow } from "./printWindow";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function dash(value: string): string {
  return isNoReading(value) ? "—" : value;
}

/** "Vở luyện viết Kanji" -- one tracing row per kanji: a guide glyph +
 * reading/meaning label + several blank practice boxes. */
export function downloadPracticeSheet(kanjiList: KanjiEntry[], boxesPerRow = 8) {
  const rows = kanjiList
    .map((k) => {
      const practiceCells = Array.from({ length: boxesPerRow })
        .map(() => `<div class="practice-cell"></div>`)
        .join("");
      return `
      <div class="practice-row">
        <div class="practice-guide">${escapeHtml(k.kanji)}</div>
        <div class="practice-guide-info">
          <div><strong>${escapeHtml(dash(k.on_yomi))}</strong></div>
          <div>${escapeHtml(dash(k.kun_yomi))}</div>
          <div>${escapeHtml(k.kan_viet)}</div>
        </div>
        ${practiceCells}
      </div>`;
    })
    .join("");

  const body = `
    <div class="doc-title">Vở luyện viết Kanji</div>
    <div class="doc-subtitle">Kanji Học Tập App &middot; ${kanjiList.length} chữ Hán</div>
    ${rows}
  `;

  openPrintWindow("Vở luyện viết Kanji", body);
}
