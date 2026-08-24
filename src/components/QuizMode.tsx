"use client";

import { useEffect, useMemo, useState } from "react";
import type { KanjiEntry } from "@/lib/types";

interface QuizModeProps {
  kanjiPool: KanjiEntry[];
}

interface Question {
  kanji: KanjiEntry;
  choices: string[];
  correctAnswer: string;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestions(pool: KanjiEntry[]): Question[] {
  const eligible = pool.filter((k) => k.meaning_vn);
  if (eligible.length < 4) return [];

  return shuffle(eligible).map((kanji) => {
    const distractorPool = eligible.filter(
      (k) => k.id !== kanji.id && k.meaning_vn !== kanji.meaning_vn
    );
    const distractors = shuffle(distractorPool)
      .slice(0, 3)
      .map((k) => k.meaning_vn);
    const choices = shuffle([kanji.meaning_vn, ...distractors]);
    return { kanji, choices, correctAnswer: kanji.meaning_vn };
  });
}

export default function QuizMode({ kanjiPool }: QuizModeProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const poolKey = useMemo(() => kanjiPool.map((k) => k.id).join(","), [kanjiPool]);

  useEffect(() => {
    setQuestions(buildQuestions(kanjiPool));
    setIndex(0);
    setSelected(null);
    setScore(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolKey]);

  function restart() {
    setQuestions(buildQuestions(kanjiPool));
    setIndex(0);
    setSelected(null);
    setScore(0);
  }

  if (kanjiPool.length < 4) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-sand-300 bg-sand-50 p-8 text-center text-sand-600 shadow-card">
        Cần ít nhất 4 chữ Kanji phù hợp với bộ lọc hiện tại để tạo câu hỏi trắc nghiệm. Hãy mở{" "}
        <strong>Cài đặt</strong> và chọn phạm vi rộng hơn.
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-sand-300 bg-sand-50 p-8 text-center text-sand-600 shadow-card">
        Đang chuẩn bị câu hỏi…
      </div>
    );
  }

  const isFinished = index >= questions.length;

  if (isFinished) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-sand-300 bg-sand-50 p-8 text-center shadow-card">
        <p className="text-lg font-semibold text-sand-700">Hoàn thành!</p>
        <p className="text-sand-600">
          Bạn trả lời đúng {score}/{questions.length} câu.
        </p>
        <button
          type="button"
          onClick={restart}
          className="btn-press rounded-full bg-sand-600 px-5 py-2 text-sm font-semibold text-sand-50 hover:brightness-95"
        >
          Làm lại
        </button>
      </div>
    );
  }

  const current = questions[index];

  function handleSelect(choice: string) {
    if (selected) return;
    setSelected(choice);
    if (choice === current.correctAnswer) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    setSelected(null);
    setIndex((i) => i + 1);
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-3 flex items-center justify-between text-sm text-sand-600">
        <span>
          Câu {index + 1}/{questions.length}
        </span>
        <span>Điểm: {score}</span>
      </div>

      <div className="rounded-3xl border border-lemon-300/70 bg-lemon-200 p-8 text-center shadow-card">
        <p className="mb-4 text-xs uppercase tracking-wide text-sand-600">
          Nghĩa của chữ Hán này là gì?
        </p>
        <span
          className="mb-6 inline-block select-none font-kyokasho leading-none text-kanjibrown"
          style={{ fontSize: "5.5rem" }}
        >
          {current.kanji.kanji}
        </span>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {current.choices.map((choice) => {
            const isCorrect = choice === current.correctAnswer;
            const isSelected = choice === selected;
            let stateClasses = "border-sand-300 bg-white hover:bg-sand-100";
            if (selected) {
              if (isCorrect) {
                stateClasses = "border-leaf-400 bg-leaf-200 text-kanjibrown";
              } else if (isSelected) {
                stateClasses = "border-red-300 bg-red-100 text-red-700";
              } else {
                stateClasses = "border-sand-200 bg-white opacity-60";
              }
            }
            return (
              <button
                key={choice}
                type="button"
                disabled={Boolean(selected)}
                onClick={() => handleSelect(choice)}
                className={`btn-press rounded-xl border px-4 py-3 text-sm font-medium text-sand-700 transition-colors ${stateClasses}`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {selected && (
          <button
            type="button"
            onClick={handleNext}
            className="btn-press mt-6 rounded-full bg-sand-600 px-6 py-2 text-sm font-semibold text-sand-50 hover:brightness-95"
          >
            {index + 1 < questions.length ? "Câu tiếp theo →" : "Xem kết quả"}
          </button>
        )}
      </div>
    </div>
  );
}
