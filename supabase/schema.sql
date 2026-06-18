-- ════════════════════════════════════════════════════════════
--  Ivory Studios — Client Portal schema
--  Paste into Supabase SQL Editor → Run. Safe to re-run.
-- ════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── Profiles ────────────────────────────────────────────────
-- One row per auth user. role drives what the portal shows.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text,
  company    text,
  phone      text,
  role       text not null default 'client' check (role in ('client','admin')),
  created_at timestamptz not null default now()
);

-- ─── Project requests ────────────────────────────────────────
-- A client's brief becomes a tracked request. status is the phase
-- the work is in; the client watches it move, the admin advances it.
create table if not exists public.project_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  project_name text not null,
  service_type text not null,
  budget_range text,
  timeline     text,
  description  text,
  status       text not null default 'new'
               check (status in (
                 'new','reviewing','discovery','design',
                 'development','optimization','launched',
                 'on_hold','completed','declined'
               )),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_requests_user   on public.project_requests(user_id);
create index if not exists idx_requests_status on public.project_requests(status);

-- ─── Request updates (activity timeline) ─────────────────────
-- Admin posts notes as the work progresses; client sees the log.
create table if not exists public.request_updates (
  id         uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.project_requests(id) on delete cascade,
  phase      text,
  message    text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_updates_request on public.request_updates(request_id);

-- ─── Auto-create a profile when someone signs up ─────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Keep updated_at fresh ───────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_touch_requests on public.project_requests;
create trigger trg_touch_requests
  before update on public.project_requests
  for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════
--  Row Level Security — the backbone of "users see only theirs"
-- ════════════════════════════════════════════════════════════
alter table public.profiles         enable row level security;
alter table public.project_requests enable row level security;
alter table public.request_updates  enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ── Profiles policies ──
drop policy if exists "profiles_select_own"   on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_own"   on public.profiles;

create policy "profiles_select_own"   on public.profiles for select to authenticated
  using (id = auth.uid());
create policy "profiles_select_admin" on public.profiles for select to authenticated
  using (public.is_admin());
create policy "profiles_update_own"   on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ── Project request policies ──
drop policy if exists "req_select_own"    on public.project_requests;
drop policy if exists "req_select_admin"  on public.project_requests;
drop policy if exists "req_insert_own"    on public.project_requests;
drop policy if exists "req_update_admin"  on public.project_requests;

create policy "req_select_own"   on public.project_requests for select to authenticated
  using (user_id = auth.uid());
create policy "req_select_admin" on public.project_requests for select to authenticated
  using (public.is_admin());
create policy "req_insert_own"   on public.project_requests for insert to authenticated
  with check (user_id = auth.uid());
-- only admins move a request between phases
create policy "req_update_admin" on public.project_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── Update timeline policies ──
drop policy if exists "upd_select_own"   on public.request_updates;
drop policy if exists "upd_select_admin" on public.request_updates;
drop policy if exists "upd_insert_admin" on public.request_updates;

create policy "upd_select_own"   on public.request_updates for select to authenticated
  using (exists (
    select 1 from public.project_requests r
    where r.id = request_id and r.user_id = auth.uid()
  ));
create policy "upd_select_admin" on public.request_updates for select to authenticated
  using (public.is_admin());
create policy "upd_insert_admin" on public.request_updates for insert to authenticated
  with check (public.is_admin());

-- ════════════════════════════════════════════════════════════
--  Make yourself admin
--  After signing up at /signup.html with either of these emails:
-- ════════════════════════════════════════════════════════════
update public.profiles set role = 'admin'
  where email in ('teams@ivorystudios.io', 'ammar@ivorystudios.io');

-- ─── done ────────────────────────────────────────────────────
