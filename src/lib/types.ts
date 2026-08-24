export type KanjiLevel = "N5" | "N4" | "N3";

/**
 * Matches the columns of the existing Supabase table `kanji_db`
 * (see the screenshot / kanji_integrated_supabase.csv the user supplied):
 *
 *   id, kanji, jlpt_level, on_yomi, kun_yomi, kan_viet, meaning_vn,
 *   REI1, REI2, REI3, REI4, unicode, japanese_on, vietnamese
 *
 * Notes on quirks in the real data:
 * - `on_yomi` / `kun_yomi` are single strings, not arrays. Some kun_yomi
 *   values are literally "なし" ("none") -- see `isNoReading` below.
 * - `japanese_on` / `vietnamese` are stored as Python-list-literal strings
 *   (e.g. "['ICHI', 'ITSU']") -- see `parsePyListString` in lib/csvUtils.ts.
 * - There is no `genre` or `stroke_count` column in the real table, unlike
 *   the placeholder schema built before this data was supplied.
 */
export interface KanjiEntry {
  id: number;
  kanji: string;
  jlpt_level: KanjiLevel;
  on_yomi: string;
  kun_yomi: string;
  kan_viet: string;
  meaning_vn: string;
  /** REI1..REI4 example words, empty strings filtered out. */
  rei: string[];
  unicode: string | null;
  /** Alternate romanized on-yomi readings parsed from `japanese_on`. */
  onyomiAlt: string[];
  /** Alternate Sino-Vietnamese readings parsed from `vietnamese`. */
  hanVietAlt: string[];
}

export function isNoReading(reading: string): boolean {
  const trimmed = reading.trim();
  return trimmed === "" || trimmed === "なし";
}

export interface DisplayFieldSettings {
  level: boolean;
  onyomi: boolean;
  kunyomi: boolean;
  hanViet: boolean;
  meaning: boolean;
}

export const DEFAULT_DISPLAY_FIELDS: DisplayFieldSettings = {
  level: true,
  onyomi: true,
  kunyomi: true,
  hanViet: true,
  meaning: true,
};

export type AppMode = "flashcard" | "quiz" | "radical";

/** A verified hen (left component) + tsukuri (right component) pair that
 * combines into a real kanji. See lib/radicalGameData.ts. */
export interface RadicalCombo {
  hen: string;
  tsukuri: string;
  result: string;
  level: Extract<KanjiLevel, "N5" | "N4">;
}

export interface KanjiFilter {
  level: KanjiLevel | "ALL";
}

export const DEFAULT_FILTER: KanjiFilter = {
  level: "ALL",
};
