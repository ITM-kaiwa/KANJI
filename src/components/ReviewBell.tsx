"use client";

import { useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getDeviceId } from "@/lib/deviceId";
import { CATEGORY_LABELS, type ContentCategory } from "@/lib/types";

interface ReviewBellProps {
  onJumpToCategory: (category: ContentCategory) => void;
}

type ContentType = "kanji" | "hiragana" | "katakana" | "vocab";

const TYPE_FALLBACK_LABELS: Record<ContentType, string> = {
  kanji: "Kanji (漢字, chưa rõ danh mục)",
  hiragana: "Hiragana (ひらがな)",
  katakana: "Katakana (カタカナ)",
  vocab: "Từ vựng (単語, chưa rõ danh mục)",
};

interface Group {
  /** null for rows recorded before the `category` column existed. */
  category: ContentCategory | null;
  contentType: ContentType;
  count: number;
}

/**
 * Review-due bell shown next to the app title. Fetches this device's
 * review_state rows once on mount and counts how many are due
 * (next_review <= now, not yet mastered) -- same due-computation the
 * flashcard screens already use, just summarized across every category
 * instead of the one currently selected. No Vercel Cron / notifications
 * table: everything here is computed live from review_state on load,
 * matching the "no login, no delivery channel" constraints already
 * established for this app's SRS.
 *
 * Grouped by the precise `category` column (not just the coarser
 * content_type) so each row can jump straight to that category's flashcard
 * screen -- content_type alone can't do that for "kanji"/"vocab" since
 * several category tables share independent id sequences. Rows written
 * before `category` existed fall back to a content_type-only group that
 * isn't clickable.
 */
export default function ReviewBell({ onJumpToCategory }: ReviewBellProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured || !supabase) return;
      const deviceId = getDeviceId();
      if (!deviceId) return;

      let { data, error } = await supabase
        .from("review_state")
        .select("content_type, category")
        .eq("device_id", deviceId)
        .neq("status", "mastered")
        .lte("next_review", new Date().toISOString());

      // Tolerate add_review_category_column.sql not having been run yet.
      if (error?.code === "PGRST204" || error?.message?.includes("category")) {
        const fallback = await supabase
          .from("review_state")
          .select("content_type")
          .eq("device_id", deviceId)
          .neq("status", "mastered")
          .lte("next_review", new Date().toISOString());
        data = fallback.data?.map((row) => ({ ...row, category: null })) ?? null;
      }

      if (!data) return;

      const counts = new Map<string, Group>();
      for (const row of data as Array<{ content_type: ContentType; category: string | null }>) {
        const key = row.category ?? `_type:${row.content_type}`;
        const existing = counts.get(key);
        if (existing) {
          existing.count++;
        } else {
          counts.set(key, {
            category: (row.category as ContentCategory | null) ?? null,
            contentType: row.content_type,
            count: 1,
          });
        }
      }
      setGroups(Array.from(counts.values()).sort((a, b) => b.count - a.count));
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

  const total = groups.reduce((sum, g) => sum + g.count, 0);

  function handleRowClick(group: Group) {
    if (!group.category) return;
    onJumpToCategory(group.category);
    setOpen(false);
  }

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
                {groups.map((group) => {
                  const label = group.category
                    ? CATEGORY_LABELS[group.category]
                    : TYPE_FALLBACK_LABELS[group.contentType];
                  const clickable = Boolean(group.category);
                  return (
                    <button
                      key={group.category ?? `_type:${group.contentType}`}
                      type="button"
                      disabled={!clickable}
                      onClick={() => handleRowClick(group)}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${
                        clickable ? "hover:bg-sand-100" : "cursor-default opacity-70"
                      }`}
                    >
                      <span className="text-sand-700">{label}</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                        {group.count}
                      </span>
                    </button>
                  );
                })}
                <div className="px-4 py-2.5 text-xs text-sand-500">
                  Nhấn vào một danh mục để bắt đầu ôn tập.
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
