"use client";

import { useEffect, useState } from "react";
import type { VocabEntry } from "@/lib/types";
import SpeakButton from "./SpeakButton";
import { ReviewButtons } from "./Flashcard";

interface VocabCardProps {
  vocab: VocabEntry;
  onPrev: () => void;
  onNext: () => void;
  onReview: (isCorrect: boolean) => void;
}

/** Minna words are short (2-6 chars); Irodori entries can run much longer
 * (e.g. "～しゅっしん（ちゅうごくしゅっしん）"), so scale the headword down
 * to keep long entries from overflowing the fixed-height card. */
function headwordFontSize(text: string): string {
  const len = text.length;
  if (len <= 6) return "3.25rem";
  if (len <= 10) return "2.4rem";
  if (len <= 16) return "1.8rem";
  return "1.4rem";
}

export default function VocabCard({ vocab, onPrev, onNext, onReview }: VocabCardProps) {
  const [flipped, setFlipped] = useState(false);
  const isIrodori = vocab.source === "irodori";

  useEffect(() => {
    setFlipped(false);
  }, [vocab.id]);

  function stop(event: React.MouseEvent) {
    event.stopPropagation();
  }

  function handleReview(isCorrect: boolean, event: React.MouseEvent) {
    event.stopPropagation();
    onReview(isCorrect);
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flip-perspective" style={{ height: 320 }}>
        <div className={`flip-inner ${flipped ? "is-flipped" : ""}`}>
          {/* ---------- FRONT ---------- */}
          <div
            className="flip-face flex flex-col overflow-hidden rounded-3xl border border-lemon-300/70 bg-lemon-200 shadow-card"
            onClick={() => setFlipped(true)}
            role="button"
            tabIndex={0}
            aria-label="Nhấn để xem nghĩa"
          >
            <NavBand side="left" onClick={onPrev} />
            <NavBand side="right" onClick={onNext} />

            <div className="absolute right-[4.25rem] top-4 z-10" onClick={stop}>
              <SpeakButton text={vocab.word} />
            </div>

            {isIrodori && vocab.partOfSpeech && (
              <span className="absolute right-[7.5rem] top-4 z-10 max-w-[7rem] truncate rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-sand-600">
                {vocab.partOfSpeech}
              </span>
            )}

            <span className="absolute left-[4.25rem] top-4 z-10 rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold text-sand-600">
              {isIrodori
                ? `${vocab.bookLabel} 第${vocab.lesson}課`
                : `Bài ${vocab.lesson} (${vocab.jlptLevel})`}
            </span>

            <div className="relative flex flex-1 flex-col items-center justify-center gap-2 px-16 py-3">
              <span
                className="select-none text-center font-kyokasho leading-tight text-kanjibrown"
                style={{ fontSize: headwordFontSize(vocab.word) }}
              >
                {vocab.word}
              </span>
              {!isIrodori && vocab.reading !== vocab.word && (
                <span className="font-kyokasho text-lg text-sand-600">({vocab.reading})</span>
              )}
              {vocab.romaji && (
                <span className="text-base font-semibold text-sand-600">[{vocab.romaji}]</span>
              )}
            </div>

            <ReviewButtons onReview={handleReview} />
          </div>

          {/* ---------- BACK ---------- */}
          <div
            className="flip-face flip-face-back flex flex-col overflow-hidden rounded-3xl border border-lemon-300/70 bg-lemon-100 shadow-card"
            onClick={() => setFlipped(false)}
            role="button"
            tabIndex={0}
            aria-label="Nhấn để xem mặt trước"
          >
            <NavBand side="left" onClick={onPrev} />
            <NavBand side="right" onClick={onNext} />

            <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-16 py-3">
              {isIrodori && vocab.kanjiForm && (
                <span
                  className="select-none text-center font-kyokasho leading-tight text-kanjibrown"
                  style={{ fontSize: headwordFontSize(vocab.kanjiForm) }}
                >
                  {vocab.kanjiForm}
                </span>
              )}
              <span className="text-xs uppercase tracking-wide text-sand-600 font-vietnamese">Nghĩa</span>
              <span className="text-center text-2xl font-semibold text-black font-vietnamese">
                {vocab.meaningVi}
              </span>
            </div>

            <ReviewButtons onReview={handleReview} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavBand({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const isLeft = side === "left";
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      aria-label={isLeft ? "Thẻ trước" : "Thẻ sau"}
      className={`btn-press absolute top-0 z-10 flex h-full w-14 items-center justify-center bg-leaf-200 text-lg font-bold text-kanjibrown/70 hover:bg-leaf-300 hover:brightness-95 hover:text-kanjibrown ${
        isLeft ? "left-0 rounded-l-3xl" : "right-0 rounded-r-3xl"
      }`}
    >
      {isLeft ? "≪" : "≫"}
    </button>
  );
}
