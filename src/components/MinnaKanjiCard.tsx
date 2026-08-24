"use client";

import { useEffect, useState } from "react";
import type { DisplayFieldSettings, MinnaKanjiEntry } from "@/lib/types";
import SpeakButton from "./SpeakButton";
import StrokeOrderAnimation from "./StrokeOrderAnimation";
import { ReviewButtons } from "./Flashcard";

interface MinnaKanjiCardProps {
  entry: MinnaKanjiEntry;
  onPrev: () => void;
  onNext: () => void;
  onReview: (isCorrect: boolean) => void;
  displayFields: DisplayFieldSettings;
}

export default function MinnaKanjiCard({
  entry,
  onPrev,
  onNext,
  onReview,
  displayFields,
}: MinnaKanjiCardProps) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [entry.id]);

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
              <SpeakButton text={entry.kanji} />
            </div>

            <span className="absolute left-[4.25rem] top-4 z-10 rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold text-sand-600">
              UNIT {entry.unit}
              {displayFields.level ? ` (${entry.jlptLevel})` : ""}
            </span>

            <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-16 py-3">
              <span
                className="select-none font-kyokasho leading-none text-kanjibrown"
                style={{ fontSize: "5.5rem" }}
              >
                {entry.kanji}
              </span>

              {(displayFields.onyomi || displayFields.kunyomi) && (
                <table className="w-full max-w-xs border-collapse text-center">
                  <tbody>
                    {displayFields.onyomi && (
                      <tr className="border-b border-lemon-300/60">
                        <td className="w-20 py-1 pr-2 text-right align-middle text-xs leading-tight text-sand-600">
                          <span className="block">音読み</span>
                          <span className="block text-[10px] opacity-80">(ON-yomi)</span>
                        </td>
                        <td className="py-1 font-kyokasho text-base font-semibold text-black">
                          {entry.onYomi}
                        </td>
                      </tr>
                    )}
                    {displayFields.kunyomi && (
                      <tr>
                        <td className="w-20 py-1 pr-2 text-right align-middle text-xs leading-tight text-sand-600">
                          <span className="block">訓読み</span>
                          <span className="block text-[10px] opacity-80">(Kun-yomi)</span>
                        </td>
                        <td className="py-1 font-kyokasho text-base font-semibold text-black">
                          {entry.kunYomi}
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

            <div className="relative flex flex-1 flex-col items-center justify-center gap-4 px-16 py-3">
              <div onClick={stop}>
                <StrokeOrderAnimation character={entry.kanji} active={flipped} size={150} />
              </div>

              {(displayFields.hanViet || displayFields.meaning) && (
                <table className="w-full max-w-xs border-collapse text-center font-vietnamese">
                  <tbody>
                    {displayFields.hanViet && (
                      <tr className="border-b border-lemon-300/60">
                        <td className="w-24 py-1.5 pr-2 text-right text-xs text-sand-600">
                          Hán Việt
                        </td>
                        <td className="py-1.5 text-base font-semibold italic text-black">
                          {entry.kanViet}
                        </td>
                      </tr>
                    )}
                    {displayFields.meaning && (
                      <tr>
                        <td className="w-24 py-1.5 pr-2 text-right text-xs text-sand-600">
                          Ý nghĩa
                        </td>
                        <td className="py-1.5 text-base font-semibold text-black">
                          {entry.meaningVi}
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
