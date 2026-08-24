"use client";

import { useEffect, useMemo, useState } from "react";
import type { KanjiEntry } from "@/lib/types";
import { getSimilarKanji } from "@/lib/similarKanjiData";

interface SimilarKanjiGridGameProps {
  kanjiPool: KanjiEntry[];
}

const GRID_SIZE = 36;

interface Round {
  target: KanjiEntry;
  decoy: string;
  correctCell: number;
}

// One round per eligible kanji (matches QuizMode / SimilarKanjiChoiceGame,
// which both run through the full pool instead of an arbitrary cap).
function buildRounds(pool: KanjiEntry[]): Round[] {
  const eligible = pool.filter((k) => getSimilarKanji(k.kanji).length > 0);
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  return shuffled.map((target) => ({
    target,
    decoy: getSimilarKanji(target.kanji)[0],
    correctCell: Math.floor(Math.random() * GRID_SIZE),
  }));
}

export default function SimilarKanjiGridGame({ kanjiPool }: SimilarKanjiGridGameProps) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCells, setWrongCells] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);

  const poolKey = useMemo(() => kanjiPool.map((k) => k.id).join(","), [kanjiPool]);

  useEffect(() => {
    setRounds(buildRounds(kanjiPool));
    setRoundIndex(0);
    setScore(0);
    setWrongCells([]);
    setSolved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolKey]);

  function restart() {
    setRounds(buildRounds(kanjiPool));
    setRoundIndex(0);
    setScore(0);
    setWrongCells([]);
    setSolved(false);
  }

  if (rounds.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-sand-300 bg-sand-50 p-8 text-center text-sand-600 shadow-card">
        Chưa có dữ liệu chữ Hán tương tự cho bộ lọc hiện tại. Hãy thử chọn Kanji N5.
      </div>
    );
  }

  const isFinished = roundIndex >= rounds.length;

  if (isFinished) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-sand-300 bg-sand-50 p-8 text-center shadow-card">
        <p className="text-lg font-semibold text-sand-700">Hoàn thành!</p>
        <p className="text-sand-600">
          Bạn tìm đúng {score}/{rounds.length} lượt.
        </p>
        <button
          type="button"
          onClick={restart}
          className="btn-press rounded-full bg-sand-600 px-5 py-2 text-sm font-semibold text-sand-50 hover:brightness-95"
        >
          Chơi lại
        </button>
      </div>
    );
  }

  const current = rounds[roundIndex];

  function handleCellClick(cell: number) {
    if (solved || wrongCells.includes(cell)) return;
    if (cell === current.correctCell) {
      setScore((s) => s + 1);
      setSolved(true);
    } else {
      setWrongCells((prev) => [...prev, cell]);
    }
  }

  function handleNext() {
    setWrongCells([]);
    setSolved(false);
    setRoundIndex((i) => i + 1);
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-3 flex items-center justify-between text-sm text-sand-600">
        <span>
          Vòng {roundIndex + 1}/{rounds.length}
        </span>
        <span>Điểm: {score}</span>
      </div>

      <div className="rounded-3xl border border-lemon-300/70 bg-lemon-200 p-5 text-center shadow-card">
        <p className="mb-2 text-xs uppercase tracking-wide text-sand-600">
          Tìm đúng chữ này trong lưới 6x6
        </p>
        <span
          className="mb-4 inline-block select-none font-kyokasho leading-none text-kanjibrown"
          style={{ fontSize: "3.5rem" }}
        >
          {current.target.kanji}
        </span>

        <div className="mx-auto grid max-w-md grid-cols-6 gap-1.5">
          {Array.from({ length: GRID_SIZE }, (_, cell) => {
            const isCorrectCell = cell === current.correctCell;
            const char = isCorrectCell ? current.target.kanji : current.decoy;
            const isWrong = wrongCells.includes(cell);
            const revealCorrect = solved && isCorrectCell;

            let stateClasses = "border-sand-300 bg-white hover:bg-sand-100";
            if (isWrong) stateClasses = "border-red-300 bg-red-100 text-red-700";
            if (revealCorrect) stateClasses = "border-leaf-400 bg-leaf-200 text-kanjibrown";

            return (
              <button
                key={cell}
                type="button"
                disabled={solved}
                onClick={() => handleCellClick(cell)}
                className={`btn-press flex aspect-square items-center justify-center rounded-lg border font-kyokasho text-xl text-sand-700 transition-colors ${stateClasses}`}
              >
                {char}
              </button>
            );
          })}
        </div>

        {solved && (
          <button
            type="button"
            onClick={handleNext}
            className="btn-press mt-5 rounded-full bg-sand-600 px-6 py-2 text-sm font-semibold text-sand-50 hover:brightness-95"
          >
            {roundIndex + 1 < rounds.length ? "Vòng tiếp theo →" : "Xem kết quả"}
          </button>
        )}
      </div>
    </div>
  );
}
