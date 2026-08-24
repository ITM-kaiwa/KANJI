"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Flashcard from "@/components/Flashcard";
import QuizMode from "@/components/QuizMode";
import RadicalGame from "@/components/RadicalGame";
import SettingsModal from "@/components/SettingsModal";
import Footer from "@/components/Footer";
import { useKanjiData } from "@/hooks/useKanjiData";
import {
  DEFAULT_DISPLAY_FIELDS,
  DEFAULT_FILTER,
  type AppMode,
  type DisplayFieldSettings,
  type KanjiFilter,
} from "@/lib/types";

export default function HomePage() {
  const [mode, setMode] = useState<AppMode>("flashcard");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filter, setFilter] = useState<KanjiFilter>(DEFAULT_FILTER);
  const [displayFields, setDisplayFields] = useState<DisplayFieldSettings>(
    DEFAULT_DISPLAY_FIELDS
  );
  const [cardIndex, setCardIndex] = useState(0);

  const { filteredKanji, loading, usingSampleData } = useKanjiData(filter);

  const safeIndex = filteredKanji.length > 0 ? cardIndex % filteredKanji.length : 0;
  const currentKanji = filteredKanji[safeIndex];

  function handleFilterChange(next: KanjiFilter) {
    setFilter(next);
    setCardIndex(0);
  }

  function goPrev() {
    setCardIndex((i) =>
      filteredKanji.length ? (i - 1 + filteredKanji.length) % filteredKanji.length : 0
    );
  }

  function goNext() {
    setCardIndex((i) => (filteredKanji.length ? (i + 1) % filteredKanji.length : 0));
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header mode={mode} onModeChange={setMode} onOpenSettings={() => setSettingsOpen(true)} />

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-8">
        {usingSampleData && (
          <p className="max-w-xl text-center text-xs text-sand-500">
            Đang hiển thị dữ liệu mẫu cục bộ (chưa kết nối Supabase, hoặc bảng &quot;kanji_db&quot;
            không trả về dữ liệu). Xem README để kết nối cơ sở dữ liệu thật.
          </p>
        )}

        {loading && <p className="text-sand-500">Đang tải dữ liệu…</p>}

        {!loading && mode === "flashcard" && currentKanji && (
          <>
            <p className="text-sm text-sand-500">
              Thẻ {safeIndex + 1}/{filteredKanji.length} ({currentKanji.jlpt_level})
            </p>
            <Flashcard
              kanji={currentKanji}
              onPrev={goPrev}
              onNext={goNext}
              displayFields={displayFields}
            />
          </>
        )}

        {!loading && mode === "flashcard" && !currentKanji && (
          <p className="text-sand-500">Không có thẻ nào phù hợp với bộ lọc hiện tại.</p>
        )}

        {!loading && mode === "quiz" && <QuizMode kanjiPool={filteredKanji} />}

        {mode === "radical" && <RadicalGame filter={filter} />}
      </main>

      <Footer />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        filter={filter}
        onFilterChange={handleFilterChange}
        displayFields={displayFields}
        onDisplayFieldsChange={setDisplayFields}
        kanjiForDownload={filteredKanji}
      />
    </div>
  );
}
