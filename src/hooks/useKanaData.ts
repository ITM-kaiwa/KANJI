"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { SAMPLE_KANA } from "@/lib/sampleKanaData";
import { isKanaCategory, type KanaEntry, type KanjiFilter, type KanaType } from "@/lib/types";

interface UseKanaDataResult {
  filteredKana: KanaEntry[];
  loading: boolean;
  usingSampleData: boolean;
}

interface KanaDbRow {
  id: number;
  character: string;
  kana_type: string;
  romaji: string;
  group_name: string;
  sort_order: number;
}

function mapRow(row: KanaDbRow): KanaEntry {
  return {
    id: row.id,
    character: row.character,
    kanaType: row.kana_type as KanaType,
    romaji: row.romaji,
    groupName: row.group_name,
  };
}

/**
 * Loads rows from the Supabase `kana_db` table (see supabase/seed_kana.sql).
 * Falls back to local sample data if Supabase isn't configured or the query
 * fails/returns nothing, mirroring useKanjiData's fallback behavior.
 */
export function useKanaData(filter: KanjiFilter): UseKanaDataResult {
  const [allKana, setAllKana] = useState<KanaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isKanaCategory(filter.level)) {
        if (!cancelled) {
          setAllKana([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      if (!isSupabaseConfigured || !supabase) {
        if (!cancelled) {
          setAllKana(SAMPLE_KANA);
          setUsingSampleData(true);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("kana_db")
        .select("id, character, kana_type, romaji, group_name, sort_order")
        .eq("kana_type", filter.level)
        .order("sort_order", { ascending: true });

      if (cancelled) return;

      if (error || !data || data.length === 0) {
        setAllKana(SAMPLE_KANA);
        setUsingSampleData(true);
      } else {
        setAllKana((data as KanaDbRow[]).map(mapRow));
        setUsingSampleData(false);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filter.level]);

  const filteredKana = useMemo(() => {
    if (!isKanaCategory(filter.level)) return [];
    return allKana.filter((k) => k.kanaType === filter.level);
  }, [allKana, filter.level]);

  return { filteredKana, loading, usingSampleData };
}
