"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KanjiFilter, RadicalCombo } from "@/lib/types";
import { RADICAL_COMBOS } from "@/lib/radicalGameData";

interface RadicalGameProps {
  filter: KanjiFilter;
}

const TOTAL_ROUNDS = 5;
const FALL_DURATION_MS = 6200;
const MAX_CANDIDATES = 6;

type Role = "hen" | "tsukuri";

interface RoundData {
  role: Role;
  promptChar: string;
  candidates: string[];
  matchingCombos: RadicalCombo[];
}

interface ResultInfo {
  success: boolean;
  resultChar: string | null;
  timedOut: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRound(combos: RadicalCombo[]): RoundData | null {
  if (combos.length === 0) return null;
  const role: Role = Math.random() < 0.5 ? "hen" : "tsukuri";

  if (role === "hen") {
    const hens = Array.from(new Set(combos.map((c) => c.hen)));
    const hen = hens[Math.floor(Math.random() * hens.length)];
    const matching = combos.filter((c) => c.hen === hen);
    const correct = Array.from(new Set(matching.map((c) => c.tsukuri)));
    const allTsukuris = Array.from(new Set(combos.map((c) => c.tsukuri)));
    const decoyPool = allTsukuris.filter((t) => !correct.includes(t));
    const decoys = shuffle(decoyPool).slice(0, Math.max(0, MAX_CANDIDATES - correct.length));
    const candidates = shuffle([...correct, ...decoys]).slice(0, MAX_CANDIDATES);
    return { role, promptChar: hen, candidates, matchingCombos: matching };
  }

  const tsukuris = Array.from(new Set(combos.map((c) => c.tsukuri)));
  const tsukuri = tsukuris[Math.floor(Math.random() * tsukuris.length)];
  const matching = combos.filter((c) => c.tsukuri === tsukuri);
  const correct = Array.from(new Set(matching.map((c) => c.hen)));
  const allHens = Array.from(new Set(combos.map((c) => c.hen)));
  const decoyPool = allHens.filter((h) => !correct.includes(h));
  const decoys = shuffle(decoyPool).slice(0, Math.max(0, MAX_CANDIDATES - correct.length));
  const candidates = shuffle([...correct, ...decoys]).slice(0, MAX_CANDIDATES);
  return { role, promptChar: tsukuri, candidates, matchingCombos: matching };
}

export default function RadicalGame({ filter }: RadicalGameProps) {
  const combos = useMemo(() => {
    if (filter.level === "N5" || filter.level === "N4") {
      return RADICAL_COMBOS.filter((c) => c.level === filter.level);
    }
    return RADICAL_COMBOS;
  }, [filter.level]);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [phase, setPhase] = useState<"falling" | "result" | "summary">("falling");
  const [result, setResult] = useState<ResultInfo | null>(null);
  const [fallTop, setFallTop] = useState(0);
  const [fallLeft, setFallLeft] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const settledRef = useRef(false);

  const startFall = useCallback(() => {
    settledRef.current = false;
    setFallTop(0);
    setFallLeft(0);
    startRef.current = performance.now();

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / FALL_DURATION_MS, 1);
      setFallTop(progress * 86);
      setFallLeft(Math.sin(progress * Math.PI * 4) * 26);

      if (progress >= 1) {
        if (!settledRef.current) {
          settledRef.current = true;
          setResult({ success: false, resultChar: null, timedOut: true });
          setPhase("result");
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startRound = useCallback(() => {
    const data = buildRound(combos);
    setRoundData(data);
    setResult(null);
    setPhase("falling");
    if (data) startFall();
  }, [combos, startFall]);

  // (Re)start the session whenever the eligible combo pool changes.
  useEffect(() => {
    setRound(1);
    setScore(0);
    startRound();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combos]);

  function handleCatch(candidate: string) {
    if (phase !== "falling" || !roundData || settledRef.current) return;
    settledRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const match = roundData.matchingCombos.find((c) =>
      roundData.role === "hen" ? c.tsukuri === candidate : c.hen === candidate
    );

    if (match) {
      setScore((s) => s + 1);
      setResult({ success: true, resultChar: match.result, timedOut: false });
    } else {
      setResult({ success: false, resultChar: null, timedOut: false });
    }
    setPhase("result");
  }

  function handleNext() {
    if (round >= TOTAL_ROUNDS) {
      setPhase("summary");
      return;
    }
    setRound((r) => r + 1);
    startRound();
  }

  function handleRestart() {
    setRound(1);
    setScore(0);
    startRound();
  }

  if (combos.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-sand-300 bg-sand-50 p-8 text-center text-sand-600 shadow-card">
        Không có bộ ghép bộ thủ nào phù hợp với bộ lọc hiện tại.
      </div>
    );
  }

  if (phase === "summary") {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-sand-300 bg-sand-50 p-8 text-center shadow-card">
        <p className="text-lg font-semibold text-sand-700">Kết thúc phiên chơi!</p>
        <p className="text-sand-600">
          Bạn ghép đúng {score}/{TOTAL_ROUNDS} chữ Hán.
        </p>
        <button
          type="button"
          onClick={handleRestart}
          className="btn-press rounded-full bg-sand-600 px-5 py-2 text-sm font-semibold text-sand-50 hover:brightness-95"
        >
          Chơi lại
        </button>
      </div>
    );
  }

  if (!roundData) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-sand-300 bg-sand-50 p-8 text-center text-sand-600 shadow-card">
        Đang chuẩn bị…
      </div>
    );
  }

  const promptLabel = roundData.role === "hen" ? "Bộ thủ TRÁI (偏)" : "Bộ thủ PHẢI (旁)";
  const candidateLabel = roundData.role === "hen" ? "Chọn phần bên PHẢI" : "Chọn phần bên TRÁI";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-3 flex items-center justify-between text-sm text-sand-600">
        <span>
          Vòng {round}/{TOTAL_ROUNDS}
        </span>
        <span>Điểm: {score}</span>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-lemon-300/70 bg-lemon-100 p-5 shadow-card sm:flex-row">
        {/* Falling zone */}
        <div className="relative mx-auto h-72 w-full max-w-[220px] shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-leaf-300 bg-lemon-200/60">
          <p className="absolute left-0 right-0 top-2 text-center text-[11px] font-medium text-sand-600">
            {promptLabel}
          </p>
          <div
            className="absolute flex h-16 w-16 select-none items-center justify-center rounded-xl border border-lemon-300 bg-lemon-200 font-kyokasho text-3xl text-kanjibrown shadow-card"
            style={{
              top: `${fallTop}%`,
              left: `calc(50% - 2rem + ${fallLeft}px)`,
              transition: phase === "falling" ? "none" : "top 0.2s ease-out",
            }}
          >
            {roundData.promptChar}
          </div>
          {/* Catch line marker */}
          <div className="absolute bottom-6 left-2 right-2 border-t-2 border-dashed border-leaf-400/70" />
        </div>

        {/* Candidate stock (right side) */}
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-center text-[11px] font-medium text-sand-600 sm:text-left">
            {candidateLabel} — nhấn thật nhanh trước khi thẻ rơi hết!
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
            {roundData.candidates.map((candidate, i) => (
              <button
                key={`${candidate}-${i}`}
                type="button"
                disabled={phase !== "falling"}
                onClick={() => handleCatch(candidate)}
                className="btn-press flex h-16 items-center justify-center rounded-xl border border-leaf-300 bg-leaf-100 font-kyokasho text-2xl text-kanjibrown shadow hover:bg-leaf-200 hover:brightness-95 disabled:opacity-60"
              >
                {candidate}
              </button>
            ))}
          </div>

          {phase === "result" && result && (
            <div
              className={`mt-2 rounded-xl border p-3 text-center text-sm ${
                result.success
                  ? "border-leaf-400 bg-leaf-100 text-kanjibrown"
                  : "border-red-300 bg-red-50 text-red-700"
              }`}
            >
              {result.timedOut && <p className="font-semibold">Hết giờ — thẻ đã rơi mất!</p>}
              {!result.timedOut && result.success && (
                <p className="font-semibold">
                  Chính xác! Ghép thành công chữ{" "}
                  <span className="font-kyokasho text-lg">{result.resultChar}</span>
                </p>
              )}
              {!result.timedOut && !result.success && (
                <p className="font-semibold">Chưa đúng — sự kết hợp này không tạo thành chữ Hán.</p>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="btn-press mt-2 rounded-full bg-sand-600 px-5 py-1.5 text-xs font-semibold text-sand-50 hover:brightness-95"
              >
                {round < TOTAL_ROUNDS ? "Thẻ tiếp theo →" : "Xem kết quả"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
