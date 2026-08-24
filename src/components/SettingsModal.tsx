"use client";

import type { DisplayFieldSettings, KanjiEntry, KanjiFilter, KanjiLevel } from "@/lib/types";
import { downloadRuledPaper } from "@/lib/pdf/ruledPaper";
import { downloadKanjiList } from "@/lib/pdf/kanjiList";
import { downloadPracticeSheet } from "@/lib/pdf/practiceSheet";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  filter: KanjiFilter;
  onFilterChange: (filter: KanjiFilter) => void;
  displayFields: DisplayFieldSettings;
  onDisplayFieldsChange: (fields: DisplayFieldSettings) => void;
  kanjiForDownload: KanjiEntry[];
}

const LEVELS: Array<KanjiLevel | "ALL"> = ["ALL", "N5", "N4", "N3"];

export default function SettingsModal({
  open,
  onClose,
  filter,
  onFilterChange,
  displayFields,
  onDisplayFieldsChange,
  kanjiForDownload,
}: SettingsModalProps) {
  if (!open) return null;

  function toggleField(key: keyof DisplayFieldSettings) {
    onDisplayFieldsChange({ ...displayFields, [key]: !displayFields[key] });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-kanjibrown-dark/30 px-4 py-10 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-pop-in rounded-2xl border border-sand-300 bg-sand-50 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between rounded-t-2xl border-b border-sand-200 bg-sand-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-sand-700">Cài đặt</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="btn-press flex h-7 w-7 items-center justify-center rounded-full text-sand-500 hover:bg-sand-200 hover:brightness-95"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-5 py-5">
          {/* --- Filters --- */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-sand-500">
              Lọc thẻ
            </h3>

            <label className="block text-sm text-sand-700">
              Cấp độ
              <select
                value={filter.level}
                onChange={(e) =>
                  onFilterChange({ ...filter, level: e.target.value as KanjiFilter["level"] })
                }
                className="mt-1 w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-sand-700 focus:border-sand-500 focus:outline-none"
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level === "ALL" ? "Tất cả cấp độ" : level}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {/* --- Display fields --- */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-sand-500">
              Hiển thị trên thẻ
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <CheckboxRow
                label="Cấp độ Kanji"
                checked={displayFields.level}
                onChange={() => toggleField("level")}
              />
              <CheckboxRow
                label="Âm On (onyomi)"
                checked={displayFields.onyomi}
                onChange={() => toggleField("onyomi")}
              />
              <CheckboxRow
                label="Âm Kun (kunyomi)"
                checked={displayFields.kunyomi}
                onChange={() => toggleField("kunyomi")}
              />
              <CheckboxRow
                label="Hán Việt"
                checked={displayFields.hanViet}
                onChange={() => toggleField("hanViet")}
              />
              <CheckboxRow
                label="Ý nghĩa"
                checked={displayFields.meaning}
                onChange={() => toggleField("meaning")}
              />
            </div>
          </section>

          {/* --- Downloads --- */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-sand-500">
              Tải xuống ({kanjiForDownload.length} chữ đang lọc)
            </h3>
            <div className="flex flex-col gap-2">
              <DownloadButton
                label="⬇ Giấy kẻ ô luyện viết"
                onClick={() => downloadRuledPaper()}
              />
              <DownloadButton
                label="⬇ Danh sách Kanji"
                onClick={() => downloadKanjiList(kanjiForDownload)}
              />
              <DownloadButton
                label="⬇ Vở luyện viết Kanji"
                onClick={() => downloadPracticeSheet(kanjiForDownload)}
              />
            </div>
            <p className="pt-1 text-[11px] leading-snug text-sand-500">
              Mỗi nút sẽ mở hộp thoại in của trình duyệt — chọn “Save as PDF” để tải xuống.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-sand-700 hover:bg-sand-100">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-sand-400 text-sand-600 focus:ring-sand-500"
      />
      {label}
    </label>
  );
}

function DownloadButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-press rounded-lg border border-sand-300 bg-white px-4 py-2 text-left text-sm font-medium text-sand-700 hover:bg-sand-100 hover:brightness-95"
    >
      {label}
    </button>
  );
}
