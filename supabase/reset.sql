-- ============================================================
-- IVORY STUDIOS — ONE-TIME CLEAN RESET
-- Run this ONCE in the Supabase SQL Editor, then run schema.sql.
-- Drops only Ivory's own objects. It never touches auth.users
-- data, the auth schema, or extensions.
-- ============================================================

-- 1) Trigger on auth.users — drop by name (table cascade can't reach it).
drop trigger if exists on_auth_user_created on auth.users;

-- 2) Drop every app table. CASCADE also removes their RLS policies,
--    indexes, foreign keys, and the triggers attached to them
--    (trg_profiles_updated, trg_requests_updated).
drop table if exists
  public.request_updates,
  public.project_requests,
  public.contact_submissions,
  public.newsletter,
  public.profiles
cascade;

-- 3) Functions live independently of tables — drop them explicitly.
drop function if exists public.set_updated_at()  cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin()        cascade;

-- Done. Now run supabase/schema.sql to rebuild everything fresh.
