"use client";

import { useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getDeviceId } from "@/lib/deviceId";

type ContentType = "kanji" | "hiragana" | "katakana" | "vocab";

const TYPE_LABELS: Record<ContentType, string> = {
  kanji: "Kanji (漢字)",
  hiragana: "Hiragana (ひらがな)",
  katakana: "Katakana (カタカナ)",
  vocab: "Từ vựng (単語)",
};

/**
 * Review-due bell shown next to the app title. Fetches this device's
 * review_state rows once on mount and counts how many are due
 * (next_review <= now, not yet mastered) -- same due-computation the
 * flashcard screens already use, just summarized across every category
 * instead of the one currently selected. No Vercel Cron / notifications
 * table: everything here is computed live from review_state on load,
 * matching the "no login, no delivery channel" constraints already
 * established for this app's SRS.
 */
export default function ReviewBell() {
  const [counts, setCounts] = useState<Record<ContentType, number>>({
    kanji: 0,
    hiragana: 0,
    katakana: 0,
    vocab: 0,
  });
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured || !supabase) return;
      const deviceId = getDeviceId();
      if (!deviceId) return;

      const { data } = await supabase
        .from("review_state")
        .select("content_type")
        .eq("device_id", deviceId)
        .neq("status", "mastered")
        .lte("next_review", new Date().toISOString());

      if (!data) return;
      const next: Record<ContentType, number> = { kanji: 0, hiragana: 0, katakana: 0, vocab: 0 };
      for (const row of data as Array<{ content_type: string }>) {
        if (row.content_type in next) next[row.content_type as ContentType]++;
      }
      setCounts(next);
    }

    load();
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const total = counts.kanji + counts.hiragana + counts.katakana + counts.vocab;
  const rows = (Object.keys(TYPE_LABELS) as ContentType[]).filter((type) => counts[type] > 0);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={total > 0 ? `Có ${total} thẻ cần ôn tập` : "Không có thẻ cần ôn tập"}
        title={total > 0 ? `Có ${total} thẻ cần ôn tập` : "Không có thẻ cần ôn tập"}
        className="btn-press relative flex h-8 w-8 items-center justify-center rounded-full text-sand-500 hover:bg-sand-200"
      >
        <BellIcon filled={total > 0} className={total > 0 ? "animate-wiggle text-amber-600" : ""} />
        {total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-sand-100 bg-red-500 px-0.5 text-[9px] font-bold text-white">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-10 z-50 w-72 overflow-hidden rounded-2xl border border-sand-300 bg-white shadow-2xl">
          <div className="border-b border-sand-200 bg-sand-100 px-4 py-2.5">
            <span className="text-sm font-bold text-sand-700">🔔 Cần ôn tập</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {total === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-sand-500">
                Không có thẻ nào cần ôn tập.
              </p>
            ) : (
              <div className="divide-y divide-sand-100">
                {rows.map((type) => (
                  <div key={type} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="text-sand-700">{TYPE_LABELS[type]}</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                      {counts[type]}
                    </span>
                  </div>
                ))}
                <div className="px-4 py-2.5 text-xs text-sand-500">
                  Mở danh mục tương ứng trong Cài đặt để ôn tập.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon({ filled, className = "" }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      className={`h-5 w-5 ${className}`}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
