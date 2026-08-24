"use client";

import type { AppMode } from "@/lib/types";

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onOpenSettings: () => void;
  onShuffle: () => void;
}

export default function Header({ mode, onModeChange, onOpenSettings, onShuffle }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 pt-6 sm:px-8">
      <div className="flex flex-wrap items-center gap-3">
        {/* Title intentionally kept small per spec -- not the visual focus. */}
        <span className="text-sm font-medium tracking-wide text-sand-600">
          漢字学習アプリ
        </span>

        <div className="flex rounded-full bg-sand-200 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => onModeChange("flashcard")}
            className={`btn-press rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              mode === "flashcard"
                ? "bg-sand-600 text-sand-50 shadow"
                : "text-sand-600 hover:bg-sand-300/70"
            }`}
          >
            Thẻ ghi nhớ
          </button>
          <button
            type="button"
            onClick={() => onModeChange("quiz")}
            className={`btn-press rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              mode === "quiz"
                ? "bg-sand-600 text-sand-50 shadow"
                : "text-sand-600 hover:bg-sand-300/70"
            }`}
          >
            Trắc nghiệm
          </button>
          <button
            type="button"
            onClick={() => onModeChange("radical")}
            className={`btn-press rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              mode === "radical"
                ? "bg-sand-600 text-sand-50 shadow"
                : "text-sand-600 hover:bg-sand-300/70"
            }`}
          >
            Ghép bộ thủ
          </button>
          <button
            type="button"
            onClick={() => onModeChange("similar-grid")}
            className={`btn-press rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              mode === "similar-grid"
                ? "bg-sand-600 text-sand-50 shadow"
                : "text-sand-600 hover:bg-sand-300/70"
            }`}
          >
            Tìm chữ đúng
          </button>
          <button
            type="button"
            onClick={() => onModeChange("similar-choice")}
            className={`btn-press rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              mode === "similar-choice"
                ? "bg-sand-600 text-sand-50 shadow"
                : "text-sand-600 hover:bg-sand-300/70"
            }`}
          >
            4 lựa chọn
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onShuffle}
          aria-label="Xáo trộn thẻ"
          title="Xáo trộn thẻ (Shuffle)"
          className="btn-press flex h-10 w-10 items-center justify-center rounded-full bg-sand-200 text-sand-700 shadow-inner hover:bg-sand-300 hover:brightness-95"
        >
          <ShuffleIcon />
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Cài đặt"
          title="Cài đặt"
          className="btn-press flex h-10 w-10 items-center justify-center rounded-full bg-sand-200 text-sand-700 shadow-inner hover:bg-sand-300 hover:brightness-95"
        >
          <GearIcon />
        </button>
      </div>
    </header>
  );
}

function ShuffleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 3h5v5M4 20 20.5 3.5M21 16v5h-5M15 15l5.5 5.5M4 4l5 5"
      />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065Z"
      />
      <circle cx="12" cy="12" r="3.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
