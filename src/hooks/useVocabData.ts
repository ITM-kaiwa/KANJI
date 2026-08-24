"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { SAMPLE_VOCAB } from "@/lib/sampleVocabData";
import {
  isIrodoriCategory,
  isVocabCategory,
  type IrodoriLevel,
  type KanjiFilter,
  type VocabEntry,
  type VocabLevel,
  type VocabSource,
} from "@/lib/types";

interface UseVocabDataResult {
  filteredVocab: VocabEntry[];
  loading: boolean;
  usingSampleData: boolean;
}

interface VocabDbRow {
  id: number;
  jlpt_level: string;
  lesson: number;
  word: string;
  reading: string;
  romaji: string | null;
  meaning_vi: string;
  source: string | null;
  kanji_form: string | null;
  part_of_speech: string | null;
  book_label: string | null;
}

function mapRow(row: VocabDbRow): VocabEntry {
  return {
    id: row.id,
    jlptLevel: row.jlpt_level as "N5" | "N4",
    lesson: row.lesson,
    word: row.word,
    reading: row.reading,
    romaji: row.romaji ?? "",
    meaningVi: row.meaning_vi,
    source: (row.source as VocabSource) ?? "minna",
    kanjiForm: row.kanji_form ?? undefined,
    partOfSpeech: row.part_of_speech ?? undefined,
    bookLabel: row.book_label ?? undefined,
  };
}

const MINNA_LEVEL_MAP: Record<VocabLevel, "N5" | "N4"> = {
  "vocab-n5": "N5",
  "vocab-n4": "N4",
};

const IRODORI_BOOK_MAP: Record<IrodoriLevel, string> = {
  "irodori-nyumon": "いろどり入門",
  "irodori-shokyu1": "いろどり初級1",
  "irodori-shokyu2": "いろどり初級2",
};

/**
 * Loads rows from the Supabase `vocab_db` table. It holds two independent
 * sources that share the same table but are never mixed together:
 * - "Minna no Nihongo" (source='minna'), filtered by jlpt_level N5/N4
 * - "いろどり" / Irodori (source='irodori'), filtered by its own book_label
 *   (入門/初級1/初級2 are separate categories, not folded into N5/N4)
 * See supabase/seed_vocab.sql and supabase/seed_irodori.sql.
 * Falls back to a small local sample otherwise, mirroring
 * useKanjiData/useKanaData's fallback behavior.
 */
export function useVocabData(filter: KanjiFilter): UseVocabDataResult {
  const [allVocab, setAllVocab] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  const isMinna = isVocabCategory(filter.level);
  const isIrodori = isIrodoriCategory(filter.level);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isMinna && !isIrodori) {
        if (!cancelled) {
          setAllVocab([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      if (!isSupabaseConfigured || !supabase) {
        if (!cancelled) {
          setAllVocab(SAMPLE_VOCAB);
          setUsingSampleData(true);
          setLoading(false);
        }
        return;
      }

      // PostgREST caps each request at the project's max-rows setting (1000
      // here), and the largest Irodori books (1189 / 1504 rows) exceed that
      // -- so page through with .range() until a page comes back short.
      const PAGE_SIZE = 1000;
      const allRows: VocabDbRow[] = [];
      let queryError: unknown = null;

      for (let page = 0; ; page++) {
        let query = supabase
          .from("vocab_db")
          .select(
            "id, jlpt_level, lesson, word, reading, romaji, meaning_vi, source, kanji_form, part_of_speech, book_label"
          )
          .order("sort_order", { ascending: true })
          .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

        if (isMinna) {
          query = query
            .eq("source", "minna")
            .eq("jlpt_level", MINNA_LEVEL_MAP[filter.level as VocabLevel]);
        } else {
          query = query
            .eq("source", "irodori")
            .eq("book_label", IRODORI_BOOK_MAP[filter.level as IrodoriLevel]);
        }

        const { data, error } = await query;
        if (error) {
          queryError = error;
          break;
        }
        if (!data || data.length === 0) break;
        allRows.push(...(data as VocabDbRow[]));
        if (data.length < PAGE_SIZE) break;
      }

      if (cancelled) return;

      if (queryError || allRows.length === 0) {
        setAllVocab(SAMPLE_VOCAB);
        setUsingSampleData(true);
      } else {
        setAllVocab(allRows.map(mapRow));
        setUsingSampleData(false);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filter.level, isMinna, isIrodori]);

  // The server-side query above already filters by category; this
  // client-side pass matters only when running on SAMPLE_VOCAB (the
  // offline/pre-seed fallback), which holds a small mix of every category.
  const filteredVocab = useMemo(() => {
    if (isMinna) {
      const jlptLevel = MINNA_LEVEL_MAP[filter.level as VocabLevel];
      return allVocab.filter((v) => v.source === "minna" && v.jlptLevel === jlptLevel);
    }
    if (isIrodori) {
      const bookLabel = IRODORI_BOOK_MAP[filter.level as IrodoriLevel];
      return allVocab.filter((v) => v.source === "irodori" && v.bookLabel === bookLabel);
    }
    return [];
  }, [allVocab, isMinna, isIrodori, filter.level]);

  return { filteredVocab, loading, usingSampleData };
}
