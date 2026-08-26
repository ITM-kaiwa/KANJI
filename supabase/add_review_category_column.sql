-- Run this once in Supabase Studio (SQL Editor) for the KANJI project
-- (https://ltxqagtohxzjfrztbbdq.supabase.co).
--
-- Adds a `category` column to review_state, storing the precise
-- ContentCategory (e.g. "N5", "minna-kanji", "irodori-nyumon") at time of
-- review. content_type alone ("kanji"/"vocab") isn't enough to know which
-- category table a content_id belongs to, since kanji_db/minna_kanji_db/
-- irodori_kanji_db (and similarly the vocab tables) each have their own
-- independent id sequence -- category is what lets the review-due bell
-- jump straight to the right flashcard screen.
--
-- Existing rows (written before this column existed) get category = null;
-- the bell shows those under a generic, non-clickable fallback group. New
-- reviews recorded after this migration always populate it.

alter table public.review_state add column if not exists category text;
