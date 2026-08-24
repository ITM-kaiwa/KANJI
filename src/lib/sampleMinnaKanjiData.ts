import type { MinnaKanjiEntry } from "./types";

/**
 * Small local fallback used before Supabase's `minna_kanji_db` table is
 * seeded (see supabase/seed_minna_kanji.sql) or if the query fails, so the
 * UI never shows a blank screen.
 */
export const SAMPLE_MINNA_KANJI: MinnaKanjiEntry[] = [
  {
    id: 1,
    kanji: "日",
    onYomi: "ニチ, ジツ",
    kunYomi: "ひ, -び, -か",
    jlptLevel: "N5",
    unit: 1,
    kanViet: "Nhật",
    meaningVi: "Ngày, mặt trời",
  },
  {
    id: 2,
    kanji: "月",
    onYomi: "ゲツ, ガツ",
    kunYomi: "つき",
    jlptLevel: "N5",
    unit: 1,
    kanViet: "Nguyệt",
    meaningVi: "Tháng, mặt trăng",
  },
];
