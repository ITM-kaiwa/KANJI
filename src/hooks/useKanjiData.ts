"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { SAMPLE_KANJI } from "@/lib/sampleData";
import { parsePyListString } from "@/lib/csvUtils";
import { isKanaCategory, type KanjiEntry, type KanjiFilter, type KanjiLevel } from "@/lib/types";

interface UseKanjiDataResult {
  allKanji: KanjiEntry[];
  filteredKanji: KanjiEntry[];
  loading: boolean;
  error: string | null;
  usingSampleData: boolean;
}

/** Raw shape of a row as it comes back from the `kanji_db` table. */
interface KanjiDbRow {
  id: number;
  kanji: string;
  jlpt_level: string;
  on_yomi: string | null;
  kun_yomi: string | null;
  kan_viet: string | null;
  meaning_vn: string | null;
  REI1: string | null;
  REI2: string | null;
  REI3: string | null;
  REI4: string | null;
  unicode: string | null;
  japanese_on: string | null;
  vietnamese: string | null;
}

function mapRow(row: KanjiDbRow): KanjiEntry {
  const rei = [row.REI1, row.REI2, row.REI3, row.REI4].filter(
    (v): v is string => Boolean(v && v.trim())
  );
  return {
    id: row.id,
    kanji: row.kanji,
    jlpt_level: (row.jlpt_level as KanjiLevel) ?? "N5",
    on_yomi: row.on_yomi ?? "",
    kun_yomi: row.kun_yomi ?? "",
    kan_viet: row.kan_viet ?? "",
    meaning_vn: row.meaning_vn ?? "",
    rei,
    unicode: row.unicode,
    onyomiAlt: parsePyListString(row.japanese_on),
    hanVietAlt: parsePyListString(row.vietnamese),
  };
}

/**
 * Loads kanji rows from the Supabase `kanji_db` table (the table the user
 * already has populated -- see kanji_integrated_supabase.csv). Re-queries
 * Supabase whenever the filter changes. Falls back to local N5 sample data
 * if Supabase isn't configured or the request fails, so the UI never shows
 * a blank screen.
 */
export function useKanjiData(filter: KanjiFilter): UseKanjiDataResult {
  const [allKanji, setAllKanji] = useState<KanjiEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      // Kana categories are served by useKanaData instead -- nothing to fetch here.
      if (isKanaCategory(filter.level)) {
        if (!cancelled) {
          setAllKanji([]);
          setUsingSampleData(false);
          setLoading(false);
        }
        return;
      }

      if (!isSupabaseConfigured || !supabase) {
        if (!cancelled) {
          setAllKanji(SAMPLE_KANJI);
          setUsingSampleData(true);
          setLoading(false);
        }
        return;
      }

      const query = supabase
        .from("kanji_db")
        .select(
          "id, kanji, jlpt_level, on_yomi, kun_yomi, kan_viet, meaning_vn, REI1, REI2, REI3, REI4, unicode, japanese_on, vietnamese"
        )
        .order("id", { ascending: true })
        .eq("jlpt_level", filter.level);

      const { data, error: queryError } = await query;

      if (cancelled) return;

      if (queryError || !data || data.length === 0) {
        setAllKanji(SAMPLE_KANJI);
        setUsingSampleData(true);
        setError(queryError ? queryError.message : null);
      } else {
        setAllKanji((data as KanjiDbRow[]).map(mapRow));
        setUsingSampleData(false);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.level]);

  // The Supabase query above already filters by level server-side; this
  // client-side pass is only relevant when running on SAMPLE_KANJI (which is
  // N5-only, so it's a no-op unless filter.level is N4/N3).
  const filteredKanji = useMemo(() => {
    if (isKanaCategory(filter.level)) return [];
    return allKanji.filter((k) => k.jlpt_level === filter.level);
  }, [allKanji, filter.level]);

  return { allKanji, filteredKanji, loading, error, usingSampleData };
}
