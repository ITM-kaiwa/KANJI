const STORAGE_KEY = "kanji-app-device-id";

/**
 * A random ID persisted in localStorage, used as the sole identity for the
 * `review_state` table since this app has no login. Anyone holding this ID
 * can read/write its rows (same trust model as localStorage itself) -- see
 * the plan's RLS notes for why this is an accepted tradeoff.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
