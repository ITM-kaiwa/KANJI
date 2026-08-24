"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { SAMPLE_IRODORI_KANJI } from "@/lib/sampleIrodoriKanjiData";
import {
  isIrodoriKanjiCategory,
  type IrodoriKanjiEntry,
  type IrodoriKanjiLevel,
  type KanjiFilter,
} from "@/lib/types";

interface UseIrodoriKanjiDataResult {
  filteredIrodoriKanji: IrodoriKanjiEntry[];
  loading: boolean;
  usingSampleData: boolean;
}

interface IrodoriKanjiDbRow {
  id: number;
  kanji: string;
  reading: string;
  example_word: string;
  example_reading: string;
  book_label: string;
  lesson: number;
  kan_viet: string;
  meaning_vi: string;
}

function mapRow(row: IrodoriKanjiDbRow): IrodoriKanjiEntry {
  return {
    id: row.id,
    kanji: row.kanji,
    reading: row.reading,
    exampleWord: row.example_word,
    exampleReading: row.example_reading,
    bookLabel: row.book_label,
    lesson: row.lesson,
    kanViet: row.kan_viet,
    meaningVi: row.meaning_vi,
  };
}

const BOOK_MAP: Record<IrodoriKanjiLevel, string> = {
  "irodori-kanji-nyumon": "いろどり入門",
  "irodori-kanji-shokyu1": "いろどり初級1",
  "irodori-kanji-shokyu2": "いろどり初級2",
  "irodori-kanji-shochukyu": "いろどり初中級",
};

/**
 * Loads rows from the Supabase `irodori_kanji_db` table (see
 * supabase/seed_irodori_kanji.sql -- the いろどり required-kanji list,
 * D:\...\kanji_list.xlsx, split into its own four book-level categories).
 * Paginates past Supabase's 1000-row default cap (see useVocabData for the
 * same issue) even though no single book currently exceeds it, since 初中級
 * alone is already 215 rows and could grow.
 */
export function useIrodoriKanjiData(filter: KanjiFilter): UseIrodoriKanjiDataResult {
  const [allRows, setAllRows] = useState<IrodoriKanjiEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  const isActive = isIrodoriKanjiCategory(filter.level);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isActive) {
        if (!cancelled) {
          setAllRows([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const bookLabel = BOOK_MAP[filter.level as IrodoriKanjiLevel];

      if (!isSupabaseConfigured || !supabase) {
        if (!cancelled) {
          setAllRows(SAMPLE_IRODORI_KANJI);
          setUsingSampleData(true);
          setLoading(false);
        }
        return;
      }

      const PAGE_SIZE = 1000;
      const rows: IrodoriKanjiDbRow[] = [];
      let queryError: unknown = null;

      for (let page = 0; ; page++) {
        const { data, error } = await supabase
          .from("irodori_kanji_db")
          .select(
            "id, kanji, reading, example_word, example_reading, book_label, lesson, kan_viet, meaning_vi"
          )
          .eq("book_label", bookLabel)
          .order("sort_order", { ascending: true })
          .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

        if (error) {
          queryError = error;
          break;
        }
        if (!data || data.length === 0) break;
        rows.push(...(data as IrodoriKanjiDbRow[]));
        if (data.length < PAGE_SIZE) break;
      }

      if (cancelled) return;

      if (queryError || rows.length === 0) {
        setAllRows(SAMPLE_IRODORI_KANJI);
        setUsingSampleData(true);
      } else {
        setAllRows(rows.map(mapRow));
        setUsingSampleData(false);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filter.level, isActive]);

  const filteredIrodoriKanji = useMemo(() => {
    if (!isActive) return [];
    const bookLabel = BOOK_MAP[filter.level as IrodoriKanjiLevel];
    return allRows.filter((r) => r.bookLabel === bookLabel);
  }, [allRows, isActive, filter.level]);

  return { filteredIrodoriKanji, loading, usingSampleData };
}
