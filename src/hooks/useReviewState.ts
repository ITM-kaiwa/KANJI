"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getDeviceId } from "@/lib/deviceId";
import type { ReviewContentType } from "@/lib/srs";

/** Maps content_id -> next_review (ms since epoch) for the given content type. */
type ReviewMap = Record<string, number>;

/**
 * Loads this device's review_state rows for a content type, so the caller
 * can sort due cards (next_review <= now) first. Only re-fetches when
 * `contentType` changes (i.e. switching category) -- deliberately NOT
 * refetched after every review, since re-sorting the deck underneath the
 * user mid-session makes "Next" jump to an unexpected card. Due-priority
 * is meant to decide what a fresh session opens with, not to live-reorder
 * an in-progress one.
 */
export function useReviewState(contentType: ReviewContentType): ReviewMap {
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
  }, [contentType]);

  return map;
}
