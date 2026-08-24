"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { SAMPLE_MINNA_KANJI } from "@/lib/sampleMinnaKanjiData";
import { isMinnaKanjiCategory, type KanjiFilter, type MinnaKanjiEntry } from "@/lib/types";

interface UseMinnaKanjiDataResult {
  filteredMinnaKanji: MinnaKanjiEntry[];
  loading: boolean;
  usingSampleData: boolean;
}

interface MinnaKanjiDbRow {
  id: number;
  kanji: string;
  on_yomi: string;
  kun_yomi: string;
  jlpt_level: string;
  unit: number;
  kan_viet: string;
  meaning_vi: string;
}

function mapRow(row: MinnaKanjiDbRow): MinnaKanjiEntry {
  return {
    id: row.id,
    kanji: row.kanji,
    onYomi: row.on_yomi,
    kunYomi: row.kun_yomi,
    jlptLevel: row.jlpt_level as "N5" | "N4",
    unit: row.unit,
    kanViet: row.kan_viet,
    meaningVi: row.meaning_vi,
  };
}

/**
 * Loads rows from the Supabase `minna_kanji_db` table (see
 * supabase/seed_minna_kanji.sql -- the "Minna no Nihongo" required-kanji
 * list, minna_no_nihongo_kanji_list.csv, UNIT1-50, N5+N4 together under one
 * "みん漢字" category rather than split like the Minna vocab pools).
 */
export function useMinnaKanjiData(filter: KanjiFilter): UseMinnaKanjiDataResult {
  const [allRows, setAllRows] = useState<MinnaKanjiEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  const isActive = isMinnaKanjiCategory(filter.level);

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

      if (!isSupabaseConfigured || !supabase) {
        if (!cancelled) {
          setAllRows(SAMPLE_MINNA_KANJI);
          setUsingSampleData(true);
          setLoading(false);
        }
        return;
      }

      const PAGE_SIZE = 1000;
      const rows: MinnaKanjiDbRow[] = [];
      let queryError: unknown = null;

      for (let page = 0; ; page++) {
        const { data, error } = await supabase
          .from("minna_kanji_db")
          .select("id, kanji, on_yomi, kun_yomi, jlpt_level, unit, kan_viet, meaning_vi")
          .order("sort_order", { ascending: true })
          .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

        if (error) {
          queryError = error;
          break;
        }
        if (!data || data.length === 0) break;
        rows.push(...(data as MinnaKanjiDbRow[]));
        if (data.length < PAGE_SIZE) break;
      }

      if (cancelled) return;

      if (queryError || rows.length === 0) {
        setAllRows(SAMPLE_MINNA_KANJI);
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
  }, [isActive]);

  return { filteredMinnaKanji: isActive ? allRows : [], loading, usingSampleData };
}
