"use client";

import { useEffect, useRef, useState } from "react";

interface KanaStrokeAnimationProps {
  character: string;
  active: boolean;
  size?: number;
}

/**
 * Plays a stroke-order animation for a single hiragana/katakana character
 * using static SVGs (public/images/kana-strokes/u{HEX}.svg), ported from the
 * sister ITM project (Synth/components/StrokeAnimation.tsx -- same SVG
 * structure: #main-lines / #main-arrows / #sub-arrows / #numbers).
 *
 * Compound sounds (拗音, e.g. "きゃ") are two characters and have no single
 * combined stroke file, so the animation is skipped for those.
 */
export default function KanaStrokeAnimation({ character, active, size = 220 }: KanaStrokeAnimationProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSvgContent(null);
    setNotFound(false);

    if (!character || character.length > 1) {
      setNotFound(true);
      return;
    }

    const hex = character.charCodeAt(0).toString(16).toLowerCase();
    let cancelled = false;

    fetch(`/images/kana-strokes/u${hex}.svg`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.text();
      })
      .then((text) => {
        if (cancelled) return;
        if (text.includes("<svg")) {
          setSvgContent(
            text.replace(/width="[^"]+"/, 'width="100%"').replace(/height="[^"]+"/, 'height="100%"')
          );
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });

    return () => {
      cancelled = true;
    };
  }, [character]);

  function playAnimation() {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;

    const paths = Array.from(svg.querySelectorAll("#main-lines path")) as SVGPathElement[];
    const mainArrows = Array.from(svg.querySelectorAll("#main-arrows path")) as SVGPathElement[];
    const subArrows = Array.from(svg.querySelectorAll("#sub-arrows path")) as SVGPathElement[];
    const numbers = Array.from(svg.querySelectorAll("#numbers text")) as SVGTextElement[];

    paths.forEach((p) => {
      const length = p.getAttribute("length") || "1000";
      p.style.strokeDasharray = length;
      p.style.strokeDashoffset = length;
      p.style.transition = "none";
    });
    mainArrows.forEach((p) => (p.style.opacity = "0"));
    subArrows.forEach((p) => (p.style.opacity = "0"));
    numbers.forEach((p) => (p.style.opacity = "0"));

    void svg.getBoundingClientRect();

    let delay = 0;
    paths.forEach((p, i) => {
      setTimeout(() => {
        p.style.transition = "stroke-dashoffset 0.8s ease-in-out";
        p.style.strokeDashoffset = "0";
        if (numbers[i]) {
          numbers[i].style.transition = "opacity 0.3s ease-in-out";
          numbers[i].style.opacity = "1";
        }
        if (mainArrows[i]) {
          mainArrows[i].style.transition = "opacity 0.3s ease-in-out";
          mainArrows[i].style.opacity = "1";
        }
      }, delay);
      delay += 900;
    });

    setTimeout(() => {
      subArrows.forEach((p) => {
        p.style.transition = "opacity 0.3s ease-in-out";
        p.style.opacity = "1";
      });
    }, delay);
  }

  useEffect(() => {
    if (svgContent && active) {
      const t = setTimeout(playAnimation, 200);
      return () => clearTimeout(t);
    }
  }, [svgContent, active]);

  if (notFound) {
    return (
      <span
        className="select-none font-kyokasho leading-none text-kanjibrown"
        style={{ fontSize: `${size / 2.5}px` }}
      >
        {character}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={containerRef}
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-xl bg-white/60"
      >
        {svgContent ? (
          <div dangerouslySetInnerHTML={{ __html: svgContent }} className="h-full w-full p-2" />
        ) : (
          <span className="text-xs text-sand-400">…</span>
        )}
      </div>
      {svgContent && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playAnimation();
          }}
          className="btn-press rounded-full bg-leaf-200 px-3 py-1 text-xs font-medium text-kanjibrown hover:bg-leaf-300 hover:brightness-95"
        >
          ↻ Xem lại nét chữ
        </button>
      )}
    </div>
  );
}
