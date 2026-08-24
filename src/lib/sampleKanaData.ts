import { KANA_SEED_DATA } from "./kanaSeedData";

/**
 * Local fallback data for hiragana/katakana, used before Supabase's
 * `kana_db` table is seeded (see supabase/seed_kana.sql) or if the query
 * fails, so the UI never shows a blank screen.
 */
export const SAMPLE_KANA = KANA_SEED_DATA;
