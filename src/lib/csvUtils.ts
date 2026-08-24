/**
 * The `japanese_on` and `vietnamese` columns in `kanji_db` are stored as
 * Python-list-literal strings, e.g. "['ICHI', 'ITSU']" or "['nhất']", and
 * are sometimes an empty string when there's no alternate reading on file.
 * Supabase/Postgres returns them to the browser as plain strings (not JSON
 * arrays), so we parse them defensively here rather than trusting the format.
 */
export function parsePyListString(value: string | null | undefined): string[] {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed || trimmed === "[]") return [];

  try {
    // Convert the Python-literal quoting (single quotes) to JSON (double
    // quotes) so JSON.parse can handle it. Good enough for this dataset,
    // which only contains simple alphabetic tokens with no embedded quotes.
    const asJson = trimmed
      .replace(/'/g, '"')
      .replace(/,\s*]/g, "]"); // tolerate trailing commas just in case
    const parsed = JSON.parse(asJson);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === "string" && v.length > 0);
    }
    return [];
  } catch {
    return [];
  }
}
