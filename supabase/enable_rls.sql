-- Run this once in Supabase Studio (SQL Editor) for project
-- https://ltxqagtohxzjfrztbbdq.supabase.co
--
-- The `kanji_db` table already exists and is already populated (see
-- kanji_integrated_supabase.csv) -- this script does NOT create or seed
-- anything. It only makes sure the browser (using the public
-- "publishable"/anon key) is allowed to READ from it. If your table
-- already has RLS disabled and readable, you can skip this.

alter table public.kanji_db enable row level security;

drop policy if exists "Public read access" on public.kanji_db;
create policy "Public read access"
  on public.kanji_db
  for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policy is created on purpose: all edits to kanji
-- data should be done from Supabase Studio (or with the service_role key),
-- never from the browser with the public anon key.
