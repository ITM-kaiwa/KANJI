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

export type AppMode = "flashcard" | "quiz" | "radical" | "similar-grid" | "similar-choice";

/** A verified hen (left component) + tsukuri (right component) pair that
 * combines into a real kanji. See lib/radicalGameData.ts. */
export interface RadicalCombo {
  hen: string;
  tsukuri: string;
  result: string;
  level: Extract<KanjiLevel, "N5" | "N4">;
}

export type KanaType = "hiragana" | "katakana";

/** "Minna no Nihongo" vocab, split by lesson range (1-25 = N5, 26-50 = N4). */
export type VocabLevel = "vocab-n5" | "vocab-n4";

/** "いろどり" (Irodori) vocab -- its own three categories, kept separate from
 * the Minna no Nihongo N5/N4 pools rather than merged into them. */
export type IrodoriLevel = "irodori-nyumon" | "irodori-shokyu1" | "irodori-shokyu2";

/** "いろどり" required-kanji list -- four book-level categories, separate
 * from both the Minna vocab pools and the plain N5/N4/N3 kanji_db pools. */
export type IrodoriKanjiLevel =
  | "irodori-kanji-nyumon"
  | "irodori-kanji-shokyu1"
  | "irodori-kanji-shokyu2"
  | "irodori-kanji-shochukyu";

/** "Minna no Nihongo" required-kanji list -- a single category (unlike the
 * Minna vocab pools, this isn't split N5/N4; both levels share one button
 * per the user's request, kept separate from kanji_db's plain N5/N4/N3). */
export type MinnaKanjiLevel = "minna-kanji";

/** The full category selector: kanji by JLPT level, kana, Minna vocab,
 * Minna kanji, Irodori vocab, or Irodori kanji. */
export type ContentCategory =
  | KanjiLevel
  | KanaType
  | VocabLevel
  | IrodoriLevel
  | IrodoriKanjiLevel
  | MinnaKanjiLevel;

export interface KanjiFilter {
  level: ContentCategory;
}

export const DEFAULT_FILTER: KanjiFilter = {
  level: "N5",
};

/** Display label per category, shared by SettingsModal's pills and
 * ReviewBell's due-review breakdown so a category always shows the same
 * name everywhere. */
export const CATEGORY_LABELS: Record<ContentCategory, string> = {
  hiragana: "ひらがな",
  katakana: "カタカナ",
  "vocab-n5": "単語 N5",
  "vocab-n4": "単語 N4",
  N5: "漢字 N5",
  N4: "漢字 N4",
  N3: "漢字 N3",
  "minna-kanji": "みん漢字",
  "irodori-nyumon": "いろ入門",
  "irodori-shokyu1": "いろ初級1",
  "irodori-shokyu2": "いろ初級2",
  "irodori-kanji-nyumon": "いろ漢-入門",
  "irodori-kanji-shokyu1": "いろ漢-初級1",
  "irodori-kanji-shokyu2": "いろ漢-初級2",
  "irodori-kanji-shochukyu": "いろ漢-初中級",
};

export function isKanaCategory(level: ContentCategory): level is KanaType {
  return level === "hiragana" || level === "katakana";
}

export function isVocabCategory(level: ContentCategory): level is VocabLevel {
  return level === "vocab-n5" || level === "vocab-n4";
}

export function isIrodoriCategory(level: ContentCategory): level is IrodoriLevel {
  return level === "irodori-nyumon" || level === "irodori-shokyu1" || level === "irodori-shokyu2";
}

export function isIrodoriKanjiCategory(level: ContentCategory): level is IrodoriKanjiLevel {
  return (
    level === "irodori-kanji-nyumon" ||
    level === "irodori-kanji-shokyu1" ||
    level === "irodori-kanji-shokyu2" ||
    level === "irodori-kanji-shochukyu"
  );
}

export function isMinnaKanjiCategory(level: ContentCategory): level is MinnaKanjiLevel {
  return level === "minna-kanji";
}

export interface KanaEntry {
  id: number;
  character: string;
  kanaType: KanaType;
  romaji: string;
  groupName: string;
}

export type VocabSource = "minna" | "irodori";

export interface VocabEntry {
  id: number;
  jlptLevel: Extract<KanjiLevel, "N5" | "N4">;
  lesson: number;
  word: string;
  reading: string;
  romaji: string;
  meaningVi: string;
  source: VocabSource;
  /** いろどり only: the kanji form, shown on the card back (front shows `word`, the kana reading). */
  kanjiForm?: string;
  /** いろどり only: part-of-speech badge text, e.g. "名詞（Noun）". */
  partOfSpeech?: string;
  /** いろどり only: book badge text, e.g. "いろどり入門". */
  bookLabel?: string;
}

/** "いろどり" required-kanji list entry. Unlike KanjiEntry (kanji_db), the
 * reading is a single free-form field (often with okurigana in parens, or
 * "*特別な読み方" for irregular readings), and each row carries exactly one
 * example word. kan_viet/meaning_vi are reused from kanji_db for kanji that
 * already exist there, or newly curated for kanji unique to this list. */
export interface IrodoriKanjiEntry {
  id: number;
  kanji: string;
  reading: string;
  exampleWord: string;
  exampleReading: string;
  bookLabel: string;
  lesson: number;
  kanViet: string;
  meaningVi: string;
}

/** "Minna no Nihongo" required-kanji list entry (UNIT1-50, minus a few
 * skipped unit numbers in the source list). on_yomi/kun_yomi/kan_viet/
 * meaning_vi all came pre-filled in the source CSV, unlike the Irodori
 * kanji list which needed cross-referencing/new data. */
export interface MinnaKanjiEntry {
  id: number;
  kanji: string;
  onYomi: string;
  kunYomi: string;
  jlptLevel: Extract<KanjiLevel, "N5" | "N4">;
  unit: number;
  kanViet: string;
  meaningVi: string;
}
