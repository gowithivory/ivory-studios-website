-- One-time clean reset. Run in the Supabase SQL editor, then run schema.sql.
-- Only drops Ivory's own objects: auth.users data, the auth schema and
-- extensions are left alone.

drop trigger if exists on_auth_user_created on auth.users;

-- cascade also removes the policies, indexes, foreign keys and table triggers
drop view if exists public.admin_requests_view;
drop table if exists
  public.request_updates,
  public.project_requests,
  public.contact_submissions,
  public.newsletter,
  public.profiles
cascade;

drop function if exists public.set_updated_at()        cascade;
drop function if exists public.handle_new_user()       cascade;
drop function if exists public.is_admin()              cascade;
drop function if exists public.is_privileged_role()    cascade;
drop function if exists public.guard_profile_update()  cascade;
drop function if exists public.guard_request_write()   cascade;
drop function if exists public.guard_contact_flood()   cascade;
