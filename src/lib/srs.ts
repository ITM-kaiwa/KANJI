import { supabase, isSupabaseConfigured } from "./supabaseClient";

export type SrsStatus = "learning" | "reviewing" | "mastered";
export type ReviewContentType = "kanji" | "hiragana" | "katakana" | "vocab";

export interface SrsRecord {
  status: SrsStatus;
  next_review: string; // ISO date string
  last_reviewed: string; // ISO date string
  interval: number; // in days
  ease_factor: number;
  mistake_count: number;
}

/**
 * SuperMemo-2 (SM-2) inspired spaced-repetition algorithm.
 * Ported from the sister ITM project (Synth/lib/srs.ts) -- same formula,
 * same interval/ease-factor/mastery thresholds.
 */
export function calculateNextReview(
  currentRecord: Partial<SrsRecord> | null,
  isCorrect: boolean
): SrsRecord {
  const now = new Date();

  if (!currentRecord) {
    if (isCorrect) {
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + 1);
      return {
        status: "reviewing",
        next_review: nextDate.toISOString(),
        last_reviewed: now.toISOString(),
        interval: 1,
        ease_factor: 2.5,
        mistake_count: 0,
      };
    }
    return {
      status: "learning",
      next_review: now.toISOString(),
      last_reviewed: now.toISOString(),
      interval: 0,
      ease_factor: 2.5,
      mistake_count: 1,
    };
  }

  let interval = currentRecord.interval ?? 0;
  let ease_factor = currentRecord.ease_factor ?? 2.5;
  let mistake_count = currentRecord.mistake_count ?? 0;

  if (isCorrect) {
    if (interval === 0) interval = 1;
    else if (interval === 1) interval = 6;
    else interval = Math.round(interval * ease_factor);
    ease_factor = Math.min(ease_factor + 0.1, 3.0);
  } else {
    interval = 0;
    ease_factor = Math.max(ease_factor - 0.2, 1.3);
    mistake_count += 1;
  }

  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + interval);

  let status: SrsStatus = "reviewing";
  if (interval === 0) status = "learning";
  if (interval > 21) status = "mastered";

  return {
    status,
    next_review: nextDate.toISOString(),
    last_reviewed: now.toISOString(),
    interval,
    ease_factor,
    mistake_count,
  };
}

/**
 * Fetches the current review_state row (if any), computes the next one, and
 * upserts it. No-ops silently if Supabase isn't configured so the flashcard
 * buttons stay usable (just without persistence) in local/offline setups.
 */
export async function processReview(
  deviceId: string,
  contentType: ReviewContentType,
  contentId: string,
  isCorrect: boolean
): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !deviceId) return;

  const { data: existing } = await supabase
    .from("review_state")
    .select("status, next_review, last_reviewed, interval, ease_factor, mistake_count")
    .eq("device_id", deviceId)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .maybeSingle();

  const nextRecord = calculateNextReview(existing, isCorrect);

  await supabase.from("review_state").upsert(
    {
      device_id: deviceId,
      content_type: contentType,
      content_id: contentId,
      ...nextRecord,
    },
    { onConflict: "device_id,content_type,content_id" }
  );
}
