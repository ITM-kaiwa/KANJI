import type { VocabEntry } from "./types";

/**
 * Small local fallback (lesson 1 only) used before Supabase's `vocab_db`
 * table is seeded (see supabase/seed_vocab.sql) or if the query fails, so
 * the UI never shows a blank screen. The real ~1,600-word dataset lives in
 * Supabase -- this file intentionally stays small to avoid bloating the
 * client bundle.
 */
export const SAMPLE_VOCAB: VocabEntry[] = [
  { id: 1, jlptLevel: "N5", lesson: 1, word: "わたし", reading: "わたし", romaji: "watashi", meaningVi: "Tôi" },
  { id: 2, jlptLevel: "N5", lesson: 1, word: "あなた", reading: "あなた", romaji: "anata", meaningVi: "Bạn/Anh/Chị" },
  { id: 3, jlptLevel: "N5", lesson: 1, word: "がくせい", reading: "がくせい", romaji: "gakusei", meaningVi: "Học sinh/Sinh viên" },
  { id: 4, jlptLevel: "N5", lesson: 1, word: "せんせい", reading: "せんせい", romaji: "sensei", meaningVi: "Giáo viên" },
  { id: 5, jlptLevel: "N5", lesson: 1, word: "だいがく", reading: "だいがく", romaji: "daigaku", meaningVi: "Trường đại học" },
  { id: 6, jlptLevel: "N4", lesson: 26, word: "たいふう", reading: "たいふう", romaji: "taifuu", meaningVi: "Bão" },
];
