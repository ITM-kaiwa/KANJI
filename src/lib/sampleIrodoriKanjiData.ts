import type { IrodoriKanjiEntry } from "./types";

/**
 * Small local fallback used before Supabase's `irodori_kanji_db` table is
 * seeded (see supabase/seed_irodori_kanji.sql) or if the query fails, so
 * the UI never shows a blank screen.
 */
export const SAMPLE_IRODORI_KANJI: IrodoriKanjiEntry[] = [
  {
    id: 1,
    kanji: "名",
    reading: "な",
    exampleWord: "名前",
    exampleReading: "なまえ",
    bookLabel: "いろどり入門",
    lesson: 3,
    kanViet: "Danh",
    meaningVi: "Tên",
  },
  {
    id: 2,
    kanji: "前",
    reading: "まえ",
    exampleWord: "名前",
    exampleReading: "なまえ",
    bookLabel: "いろどり入門",
    lesson: 3,
    kanViet: "Tiền",
    meaningVi: "Trước",
  },
];
