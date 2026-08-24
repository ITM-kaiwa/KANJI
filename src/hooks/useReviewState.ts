"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getDeviceId } from "@/lib/deviceId";
import type { ReviewContentType } from "@/lib/srs";

/** Maps content_id -> next_review (ms since epoch) for the given content type. */
type ReviewMap = Record<string, number>;

/**
 * Loads this device's review_state rows for a content type, so the caller
 * can sort due cards (next_review <= now) first. Re-fetches whenever
 * `refreshKey` changes (bump it after a review is recorded).
 */
export function useReviewState(contentType: ReviewContentType, refreshKey: number): ReviewMap {
  const [map, setMap] = useState<ReviewMap>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured || !supabase) return;
      const deviceId = getDeviceId();
      if (!deviceId) return;

      const { data } = await supabase
        .from("review_state")
        .select("content_id, next_review")
        .eq("device_id", deviceId)
        .eq("content_type", contentType);

      if (cancelled || !data) return;

      const next: ReviewMap = {};
      for (const row of data as Array<{ content_id: string; next_review: string }>) {
        next[row.content_id] = new Date(row.next_review).getTime();
      }
      setMap(next);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [contentType, refreshKey]);

  return map;
}
