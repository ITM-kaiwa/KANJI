"use client";

import { useEffect, useState } from "react";
import type { KanaEntry } from "@/lib/types";
import SpeakButton from "./SpeakButton";
import KanaStrokeAnimation from "./KanaStrokeAnimation";
import { ReviewButtons } from "./Flashcard";

interface KanaCardProps {
  kana: KanaEntry;
  onPrev: () => void;
  onNext: () => void;
  onReview: (isCorrect: boolean) => void;
}

export default function KanaCard({ kana, onPrev, onNext, onReview }: KanaCardProps) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [kana.id]);

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
            aria-label="Nhấn để xem nét chữ"
          >
            <NavBand side="left" onClick={onPrev} />
            <NavBand side="right" onClick={onNext} />

            <div className="absolute right-[4.25rem] top-4 z-10" onClick={stop}>
              <SpeakButton text={kana.character} />
            </div>

            <span className="absolute left-[4.25rem] top-4 z-10 rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold text-sand-600">
              {kana.groupName}
            </span>

            <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-16 py-3">
              <span
                className="select-none font-kyokasho leading-none text-kanjibrown"
                style={{ fontSize: "5.5rem" }}
              >
                {kana.character}
              </span>
              <span className="text-xl font-semibold text-sand-600">[{kana.romaji}]</span>
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
                <KanaStrokeAnimation character={kana.character} active={flipped} size={170} />
              </div>
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
