"use client";

import { useEffect, useState } from "react";
import { isNoReading, type DisplayFieldSettings, type KanjiEntry } from "@/lib/types";
import SpeakButton from "./SpeakButton";
import StrokeOrderAnimation from "./StrokeOrderAnimation";

interface FlashcardProps {
  kanji: KanjiEntry;
  onPrev: () => void;
  onNext: () => void;
  displayFields: DisplayFieldSettings;
  onReview: (isCorrect: boolean) => void;
}

function readingOrDash(reading: string): string {
  return isNoReading(reading) ? "—" : reading;
}

export default function Flashcard({ kanji, onPrev, onNext, displayFields, onReview }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  // Always show the front face again when moving to a different card.
  useEffect(() => {
    setFlipped(false);
  }, [kanji.id]);

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
            aria-label="Nhấn để xem mặt sau"
          >
            <NavBand side="left" onClick={onPrev} />
            <NavBand side="right" onClick={onNext} />

            <div className="absolute right-[4.25rem] top-4 z-10" onClick={stop}>
              <SpeakButton text={kanji.kanji} />
            </div>

            {displayFields.level && (
              <span className="absolute left-[4.25rem] top-4 z-10 rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold text-sand-600">
                {kanji.jlpt_level}
              </span>
            )}

            <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-16 py-3">
              <span
                className="select-none font-kyokasho leading-none text-kanjibrown"
                style={{ fontSize: "5.5rem" }}
              >
                {kanji.kanji}
              </span>

              {(displayFields.onyomi || displayFields.kunyomi) && (
                <table className="w-full max-w-xs border-collapse text-center">
                  <tbody>
                    {displayFields.onyomi && (
                      <tr className="border-b border-lemon-300/60">
                        <td className="w-20 py-1 pr-2 text-right text-xs text-sand-500">
                          音読み
                        </td>
                        <td className="py-1 font-kyokasho text-base font-semibold text-black">
                          {readingOrDash(kanji.on_yomi)}
                        </td>
                      </tr>
                    )}
                    {displayFields.kunyomi && (
                      <tr>
                        <td className="w-20 py-1 pr-2 text-right text-xs text-sand-500">
                          訓読み
                        </td>
                        <td className="py-1 font-kyokasho text-base font-semibold text-black">
                          {readingOrDash(kanji.kun_yomi)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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

            <div className="relative flex flex-1 flex-col items-center justify-center gap-2 px-16 py-3">
              <div onClick={stop}>
                <StrokeOrderAnimation character={kanji.kanji} active={flipped} size={150} />
              </div>

              {(displayFields.hanViet || displayFields.meaning) && (
                <table className="w-full max-w-xs border-collapse text-center font-vietnamese">
                  <tbody>
                    {displayFields.hanViet && (
                      <tr className="border-b border-lemon-300/60">
                        <td className="w-24 py-1.5 pr-2 text-right text-xs text-sand-500">
                          Hán Việt
                        </td>
                        <td className="py-1.5 text-base font-semibold italic text-black">
                          {kanji.kan_viet || "—"}
                        </td>
                      </tr>
                    )}
                    {displayFields.meaning && (
                      <tr>
                        <td className="w-24 py-1.5 pr-2 text-right text-xs text-sand-500">
                          Ý nghĩa
                        </td>
                        <td className="py-1.5 text-base font-semibold text-black">
                          {kanji.meaning_vn || "—"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <ReviewButtons onReview={handleReview} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReviewButtons({
  onReview,
}: {
  onReview: (isCorrect: boolean, event: React.MouseEvent) => void;
}) {
  return (
    <div className="flex shrink-0 gap-2 border-t border-lemon-300/60 px-16 py-2.5">
      <button
        type="button"
        onClick={(event) => onReview(false, event)}
        className="btn-press flex-1 rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-200 hover:brightness-95"
      >
        Chưa nhớ
      </button>
      <button
        type="button"
        onClick={(event) => onReview(true, event)}
        className="btn-press flex-1 rounded-xl bg-leaf-200 px-3 py-2 text-xs font-bold text-kanjibrown hover:bg-leaf-300 hover:brightness-95"
      >
        Đã nhớ
      </button>
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
