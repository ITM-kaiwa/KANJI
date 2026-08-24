"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Flashcard from "@/components/Flashcard";
import KanaCard from "@/components/KanaCard";
import VocabCard from "@/components/VocabCard";
import QuizMode from "@/components/QuizMode";
import RadicalGame from "@/components/RadicalGame";
import SimilarKanjiGridGame from "@/components/SimilarKanjiGridGame";
import SimilarKanjiChoiceGame from "@/components/SimilarKanjiChoiceGame";
import SettingsModal from "@/components/SettingsModal";
import Footer from "@/components/Footer";
import { useKanjiData } from "@/hooks/useKanjiData";
import { useKanaData } from "@/hooks/useKanaData";
import { useVocabData } from "@/hooks/useVocabData";
import { useReviewState } from "@/hooks/useReviewState";
import { getDeviceId } from "@/lib/deviceId";
import { processReview, type ReviewContentType } from "@/lib/srs";
import {
  DEFAULT_DISPLAY_FIELDS,
  DEFAULT_FILTER,
  isIrodoriCategory,
  isKanaCategory,
  isVocabCategory,
  type AppMode,
  type DisplayFieldSettings,
  type KanjiFilter,
} from "@/lib/types";

type ContentKind = "kanji" | "kana" | "vocab";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function contentKindOf(level: KanjiFilter["level"]): ContentKind {
  if (isKanaCategory(level)) return "kana";
  if (isVocabCategory(level) || isIrodoriCategory(level)) return "vocab";
  return "kanji";
}

export default function HomePage() {
  const [mode, setMode] = useState<AppMode>("flashcard");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filter, setFilter] = useState<KanjiFilter>(DEFAULT_FILTER);
  const [displayFields, setDisplayFields] = useState<DisplayFieldSettings>(
    DEFAULT_DISPLAY_FIELDS
  );
  const [cardIndex, setCardIndex] = useState(0);
  const [order, setOrder] = useState<number[]>([]);

  const kind = contentKindOf(filter.level);
  const contentType: ReviewContentType = isKanaCategory(filter.level)
    ? filter.level
    : isVocabCategory(filter.level) || isIrodoriCategory(filter.level)
      ? "vocab"
      : "kanji";

  const { filteredKanji, loading: kanjiLoading, usingSampleData } = useKanjiData(filter);
  const { filteredKana, loading: kanaLoading } = useKanaData(filter);
  const { filteredVocab, loading: vocabLoading } = useVocabData(filter);
  const loading = kind === "kana" ? kanaLoading : kind === "vocab" ? vocabLoading : kanjiLoading;

  const reviewMap = useReviewState(contentType);

  // Cards with a due (or never-reviewed) next_review sort first; shuffling
  // (below) overrides this with pure randomness.
  const prioritized = useMemo(() => {
    const list: Array<{ id: number }> =
      kind === "kana" ? filteredKana : kind === "vocab" ? filteredVocab : filteredKanji;
    const now = Date.now();
    return [...list].sort((a, b) => {
      const dueA = reviewMap[String(a.id)] ?? 0;
      const dueB = reviewMap[String(b.id)] ?? 0;
      const isDueA = dueA <= now;
      const isDueB = dueB <= now;
      if (isDueA !== isDueB) return isDueA ? -1 : 1;
      return dueA - dueB;
    });
  }, [kind, filteredKana, filteredVocab, filteredKanji, reviewMap]);

  // Reset to a fresh identity order whenever the underlying list changes
  // (filter switch, data load, etc).
  useEffect(() => {
    setOrder(prioritized.map((_, i) => i));
    setCardIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prioritized.length, kind, filter.level]);

  const displayList = order.map((i) => prioritized[i]).filter(Boolean);
  const safeIndex = displayList.length > 0 ? cardIndex % displayList.length : 0;
  const currentKanji =
    kind === "kanji" ? (displayList[safeIndex] as (typeof filteredKanji)[number]) : undefined;
  const currentKana =
    kind === "kana" ? (displayList[safeIndex] as (typeof filteredKana)[number]) : undefined;
  const currentVocab =
    kind === "vocab" ? (displayList[safeIndex] as (typeof filteredVocab)[number]) : undefined;

  function handleFilterChange(next: KanjiFilter) {
    setFilter(next);
    setCardIndex(0);
  }

  function handleShuffle() {
    setOrder((prev) => shuffle(prev.length ? prev : prioritized.map((_, i) => i)));
    setCardIndex(0);
  }

  function goPrev() {
    setCardIndex((i) => (displayList.length ? (i - 1 + displayList.length) % displayList.length : 0));
  }

  function goNext() {
    setCardIndex((i) => (displayList.length ? (i + 1) % displayList.length : 0));
  }

  async function handleReview(isCorrect: boolean) {
    const current = currentKanji ?? currentKana ?? currentVocab;
    if (!current) return;
    const deviceId = getDeviceId();
    await processReview(deviceId, contentType, String(current.id), isCorrect);
    goNext();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        mode={mode}
        onModeChange={setMode}
        onOpenSettings={() => setSettingsOpen(true)}
        onShuffle={handleShuffle}
      />

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-8">
        {usingSampleData && kind === "kanji" && (
          <p className="max-w-xl text-center text-xs text-sand-600">
            Đang hiển thị dữ liệu mẫu cục bộ (chưa kết nối Supabase, hoặc bảng &quot;kanji_db&quot;
            không trả về dữ liệu). Xem README để kết nối cơ sở dữ liệu thật.
          </p>
        )}

        {loading && <p className="text-sand-600">Đang tải dữ liệu…</p>}

        {!loading && mode === "flashcard" && kind === "kana" && currentKana && (
          <>
            <p className="text-sm text-sand-600">
              Thẻ {safeIndex + 1}/{displayList.length} ({currentKana.groupName})
            </p>
            <KanaCard kana={currentKana} onPrev={goPrev} onNext={goNext} onReview={handleReview} />
          </>
        )}

        {!loading && mode === "flashcard" && kind === "vocab" && currentVocab && (
          <>
            <p className="text-sm text-sand-600">
              Thẻ {safeIndex + 1}/{displayList.length} (Bài {currentVocab.lesson})
            </p>
            <VocabCard
              vocab={currentVocab}
              onPrev={goPrev}
              onNext={goNext}
              onReview={handleReview}
            />
          </>
        )}

        {!loading && mode === "flashcard" && kind === "kanji" && currentKanji && (
          <>
            <p className="text-sm text-sand-600">
              Thẻ {safeIndex + 1}/{displayList.length} ({currentKanji.jlpt_level})
            </p>
            <Flashcard
              kanji={currentKanji}
              onPrev={goPrev}
              onNext={goNext}
              displayFields={displayFields}
              onReview={handleReview}
            />
          </>
        )}

        {!loading && mode === "flashcard" && displayList.length === 0 && (
          <p className="text-sand-600">Không có thẻ nào phù hợp với bộ lọc hiện tại.</p>
        )}

        {!loading && mode === "quiz" && <QuizMode kanjiPool={filteredKanji} />}

        {mode === "radical" && <RadicalGame filter={filter} />}

        {mode === "similar-grid" && <SimilarKanjiGridGame kanjiPool={filteredKanji} />}

        {mode === "similar-choice" && <SimilarKanjiChoiceGame kanjiPool={filteredKanji} />}
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
