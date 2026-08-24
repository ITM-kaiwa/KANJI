"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { SAMPLE_VOCAB } from "@/lib/sampleVocabData";
import { isVocabCategory, type KanjiFilter, type VocabEntry, type VocabLevel } from "@/lib/types";

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
  };
}

const LEVEL_MAP: Record<VocabLevel, "N5" | "N4"> = {
  "vocab-n5": "N5",
  "vocab-n4": "N4",
};

/**
 * Loads rows from the Supabase `vocab_db` table (see
 * supabase/seed_vocab.sql -- "Minna no Nihongo" vocabulary, lessons 1-25 =
 * N5, 26-50 = N4). Falls back to a small local sample otherwise, mirroring
 * useKanjiData/useKanaData's fallback behavior.
 */
export function useVocabData(filter: KanjiFilter): UseVocabDataResult {
  const [allVocab, setAllVocab] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isVocabCategory(filter.level)) {
        if (!cancelled) {
          setAllVocab([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const jlptLevel = LEVEL_MAP[filter.level];

      if (!isSupabaseConfigured || !supabase) {
        if (!cancelled) {
          setAllVocab(SAMPLE_VOCAB);
          setUsingSampleData(true);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("vocab_db")
        .select("id, jlpt_level, lesson, word, reading, romaji, meaning_vi")
        .eq("jlpt_level", jlptLevel)
        .order("sort_order", { ascending: true });

      if (cancelled) return;

      if (error || !data || data.length === 0) {
        setAllVocab(SAMPLE_VOCAB);
        setUsingSampleData(true);
      } else {
        setAllVocab((data as VocabDbRow[]).map(mapRow));
        setUsingSampleData(false);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filter.level]);

  const filteredVocab = useMemo(() => {
    if (!isVocabCategory(filter.level)) return [];
    const jlptLevel = LEVEL_MAP[filter.level];
    return allVocab.filter((v) => v.jlptLevel === jlptLevel);
  }, [allVocab, filter.level]);

  return { filteredVocab, loading, usingSampleData };
}
