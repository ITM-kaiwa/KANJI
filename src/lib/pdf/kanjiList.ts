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

/** "Danh sách Kanji" -- a printable table of the currently filtered kanji. */
export function downloadKanjiList(kanjiList: KanjiEntry[]) {
  const rows = kanjiList
    .map(
      (k, i) => `
      <tr>
        <td>${i + 1}</td>
        <td class="kanji-cell">${escapeHtml(k.kanji)}</td>
        <td>${escapeHtml(k.jlpt_level)}</td>
        <td>${escapeHtml(dash(k.on_yomi))}</td>
        <td>${escapeHtml(dash(k.kun_yomi))}</td>
        <td>${escapeHtml(k.kan_viet)}</td>
        <td>${escapeHtml(k.meaning_vn)}</td>
      </tr>`
    )
    .join("");

  const body = `
    <div class="doc-title">Danh sách Kanji</div>
    <div class="doc-subtitle">Kanji Học Tập App &middot; ${kanjiList.length} chữ Hán</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Hán tự</th>
          <th>Cấp độ</th>
          <th>Âm On</th>
          <th>Âm Kun</th>
          <th>Hán Việt</th>
          <th>Nghĩa</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  openPrintWindow("Danh sách Kanji", body);
}
