"use client";

import { useEffect, useRef, useState } from "react";
import type HanziWriterType from "hanzi-writer";

interface StrokeOrderAnimationProps {
  character: string;
  /** Only auto-plays the animation while true (i.e. the card is face-up on the back). */
  active: boolean;
  size?: number;
}

/**
 * Renders an SVG stroke-order animation for a single kanji using HanziWriter.
 *
 * Note on data source: HanziWriter's default stroke data (from the
 * make-me-a-hanzi project) is Chinese-character stroke data. It matches
 * Japanese kanji correctly in the large majority of cases since most kyoiku
 * kanji share the same stroke skeleton, but a small number of shinjitai
 * forms differ from their Chinese counterparts. For production accuracy,
 * swap the character-data loader for KanjiVG (https://kanjivg.tagaini.net/),
 * which is stroke data drawn specifically for Japanese kanji.
 */
export default function StrokeOrderAnimation({
  character,
  active,
  size = 220,
}: StrokeOrderAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriterType | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    writerRef.current = null;

    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    import("hanzi-writer").then((mod) => {
      if (cancelled || !containerRef.current) return;
      const HanziWriter = mod.default;

      const writer = HanziWriter.create(containerRef.current, character, {
        width: size,
        height: size,
        padding: 10,
        showOutline: true,
        strokeColor: "#6B4226",
        radicalColor: "#B08D57",
        outlineColor: "#E0CFA8",
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 250,
        onLoadCharDataError: () => {
          if (!cancelled) setLoadError(true);
        },
      });

      writerRef.current = writer;
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, size]);

  useEffect(() => {
    if (active) {
      writerRef.current?.animateCharacter();
    }
  }, [active, character]);

  const handleReplay = (event: React.MouseEvent) => {
    event.stopPropagation();
    writerRef.current?.animateCharacter();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={containerRef}
        style={{ width: size, height: size }}
        className="rounded-xl bg-white/40"
      />
      {loadError && (
        <span className="text-center text-[11px] leading-tight text-sand-600">
          Không tải được dữ liệu nét chữ cho &quot;{character}&quot;.
        </span>
      )}
      <button
        type="button"
        onClick={handleReplay}
        className="btn-press rounded-full bg-leaf-200 px-3 py-1 text-xs font-medium text-kanjibrown hover:bg-leaf-300 hover:brightness-95"
      >
        ↻ Xem lại nét chữ
      </button>
    </div>
  );
}
