-- Ivory Studios database schema.
-- Paste into the Supabase SQL editor and run. Safe to re-run.
-- Run `npm run test:db` after any change. Setup notes: supabase/SETUP.md


--  TABLES

create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  full_name   text        check (char_length(full_name) <= 120),
  email       text        check (char_length(email) <= 200),
  company     text        check (char_length(company) <= 120),
  phone       text        check (char_length(phone) <= 40),
  avatar_url  text        check (char_length(avatar_url) <= 500),
  role        text        not null default 'client' check (role in ('client','admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.project_requests (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  project_name  text        not null check (char_length(project_name) between 1 and 120),
  service_type  text        not null check (char_length(service_type) between 1 and 60),
  company       text        check (char_length(company) <= 120),
  phone         text        check (char_length(phone) <= 40),
  budget_range  text        check (char_length(budget_range) <= 40),
  timeline      text        check (char_length(timeline) <= 40),
  description   text        check (char_length(description) <= 2000),
  status        text        not null default 'new'
                            check (status in ('new','reviewing','discovery','design','development',
                                              'feedback','optimization','launched','on_hold','completed','declined')),
  priority      text        not null default 'normal' check (priority in ('low','normal','high','urgent')),
  start_date    date,
  target_date   date,
  progress      smallint    check (progress between 0 and 100),
  archived      boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.request_updates (
  id          uuid        primary key default gen_random_uuid(),
  request_id  uuid        not null references public.project_requests(id) on delete cascade,
  phase       text        check (char_length(phase) <= 40),
  message     text        not null check (char_length(message) between 1 and 500),
  is_internal boolean     not null default false,
  created_by  uuid        references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.contact_submissions (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null check (char_length(name)    between 2 and 120),
  email       text        not null check (char_length(email)   <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  company     text        check (char_length(company) <= 120),
  service     text        check (char_length(service) <= 200),
  message     text        not null check (char_length(message) between 10 and 4500),
  source      text        default 'website' check (char_length(source) <= 50),
  ip_hash     text,
  created_at  timestamptz not null default now()
);

create table if not exists public.newsletter (
  id          uuid        primary key default gen_random_uuid(),
  email       text        not null unique check (char_length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  status      text        not null default 'active' check (status in ('active','unsubscribed')),
  created_at  timestamptz not null default now()
);

--  PROJECT TRACKING (added Oct 2026; safe on databases created before it)
--  progress = share of the agreed scope delivered, set by an admin. Null means
--  "not stated", and the portal then shows the phase only.

alter table public.project_requests add column if not exists start_date  date;
alter table public.project_requests add column if not exists target_date date;
alter table public.project_requests add column if not exists progress    smallint check (progress between 0 and 100);
alter table public.project_requests add column if not exists archived    boolean not null default false;
alter table public.project_requests drop constraint if exists project_requests_status_check;
alter table public.project_requests add constraint project_requests_status_check
  check (status in ('new','reviewing','discovery','design','development',
                    'feedback','optimization','launched','on_hold','completed','declined'));
alter table public.project_requests drop constraint if exists project_requests_dates_check;
alter table public.project_requests add constraint project_requests_dates_check
  check (target_date is null or start_date is null or target_date >= start_date);

create table if not exists public.project_milestones (
  id          uuid        primary key default gen_random_uuid(),
  request_id  uuid        not null references public.project_requests(id) on delete cascade,
  title       text        not null check (char_length(title) between 1 and 120),
  due_date    date,
  done        boolean     not null default false,
  done_at     timestamptz,
  position    smallint    not null default 0,
  created_at  timestamptz not null default now()
);

--  INDEXES

create index if not exists idx_profiles_role        on public.profiles(role);
create index if not exists idx_requests_user        on public.project_requests(user_id);
create index if not exists idx_requests_status_upd  on public.project_requests(status, updated_at desc);
create index if not exists idx_requests_created     on public.project_requests(created_at desc);
create index if not exists idx_updates_request      on public.request_updates(request_id, created_at desc);
create index if not exists idx_updates_created_by   on public.request_updates(created_by);
create index if not exists idx_contact_created      on public.contact_submissions(created_at desc);
create index if not exists idx_contact_email        on public.contact_submissions(email, created_at desc);
create index if not exists idx_milestones_request   on public.project_milestones(request_id, position);

--  FUNCTIONS

create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Is the signed-in user an admin? (security definer so RLS policies can call it)
create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Privileged database roles (SQL editor / service key) skip the guards below.
create or replace function public.is_privileged_role()
returns boolean language sql stable
as $$ select current_user in ('postgres', 'supabase_admin', 'service_role'); $$;

-- New auth user → matching profile row. Role is ALWAYS 'client' here.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 120),
    left(new.email, 200),
    'client'
  )
  on conflict (id) do update
    set email     = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$;

-- Clients may never promote themselves or rewrite their own identity/email.
create or replace function public.guard_profile_update()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if public.is_privileged_role() or public.is_admin() then return new; end if;
  new.role  := old.role;
  new.email := old.email;
  new.id    := old.id;
  return new;
end;
$$;

-- Clients cannot choose their own status/priority or reassign a request.
create or replace function public.guard_request_write()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if public.is_privileged_role() or public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.status      := 'new';
    new.priority    := 'normal';
    new.progress    := null;
    new.start_date  := null;
    new.target_date := null;
    new.archived    := false;
    new.created_at  := now();
    new.updated_at  := now();
  else
    new.created_at  := old.created_at;
    new.user_id     := old.user_id;
    new.status      := old.status;
    new.priority    := old.priority;
    new.progress    := old.progress;
    new.start_date  := old.start_date;
    new.target_date := old.target_date;
    new.archived    := old.archived;
  end if;
  return new;
end;
$$;

-- Flood guard for the public contact form (the anon key is public by design).
create or replace function public.guard_contact_flood()
returns trigger language plpgsql security definer   -- must count rows the anon role cannot read
set search_path = public
as $$
begin
  -- Server sets these. Otherwise a backdated created_at would slip past the
  -- rate limits below.
  new.created_at := now();
  new.ip_hash    := null;
  if (select count(*) from public.contact_submissions
       where email = new.email and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Too many enquiries from this email. Please email teams@ivorystudios.io.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.contact_submissions
       where created_at > now() - interval '1 minute') >= 20 then
    raise exception 'We are receiving a lot of traffic. Please try again shortly.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- Project history, written by the database so it can't be skipped or faked
-- from the browser. Client-facing changes are public; reassignment is internal.
create or replace function public.log_request_change()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  labels jsonb := '{"new":"New","reviewing":"In review","discovery":"Discovery","design":"Design","development":"Development","feedback":"Awaiting your feedback","optimization":"Optimisation","launched":"Launched","on_hold":"On hold","completed":"Completed","declined":"Declined"}';
begin
  if tg_op = 'INSERT' then
    if auth.uid() is distinct from new.user_id then
      insert into public.request_updates (request_id, phase, message, created_by)
      values (new.id, new.status, 'Project set up in your workspace.', auth.uid());
    end if;
    return new;
  end if;
  if new.status is distinct from old.status then
    insert into public.request_updates (request_id, phase, message, created_by)
    values (new.id, new.status, 'Status changed to ' || coalesce(labels->>new.status, new.status) || '.', auth.uid());
  end if;
  if new.progress is distinct from old.progress and new.progress is not null then
    insert into public.request_updates (request_id, phase, message, created_by)
    values (new.id, new.status, 'Progress updated to ' || new.progress || '%.', auth.uid());
  end if;
  if new.target_date is distinct from old.target_date then
    insert into public.request_updates (request_id, phase, message, created_by)
    values (new.id, new.status, case when new.target_date is null then 'Target date removed.'
      else 'Target date set to ' || to_char(new.target_date, 'FMDD Mon YYYY') || '.' end, auth.uid());
  end if;
  if new.user_id is distinct from old.user_id then
    insert into public.request_updates (request_id, phase, message, is_internal, created_by)
    values (new.id, new.status, 'Project reassigned to another client account.', true, auth.uid());
  end if;
  return new;
end;
$$;

create or replace function public.log_milestone_change()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  if new.done and not coalesce(old.done, false) then
    new.done_at := now();
    insert into public.request_updates (request_id, message, created_by)
    values (new.request_id, 'Milestone completed: ' || new.title, auth.uid());
  elsif not new.done then
    new.done_at := null;
  end if;
  return new;
end;
$$;

--  TRIGGERS

drop trigger if exists trg_profiles_updated       on public.profiles;
drop trigger if exists trg_requests_updated       on public.project_requests;
drop trigger if exists trg_profiles_guard         on public.profiles;
drop trigger if exists trg_requests_guard         on public.project_requests;
drop trigger if exists trg_contact_flood          on public.contact_submissions;
drop trigger if exists on_auth_user_created       on auth.users;
drop trigger if exists trg_requests_log           on public.project_requests;
drop trigger if exists trg_milestones_log         on public.project_milestones;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_requests_updated before update on public.project_requests
  for each row execute function public.set_updated_at();
create trigger trg_profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_update();
create trigger trg_requests_guard before insert or update on public.project_requests
  for each row execute function public.guard_request_write();
create trigger trg_contact_flood before insert on public.contact_submissions
  for each row execute function public.guard_contact_flood();
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
create trigger trg_requests_log after insert or update on public.project_requests
  for each row execute function public.log_request_change();
create trigger trg_milestones_log before insert or update on public.project_milestones
  for each row execute function public.log_milestone_change();

--  ROW LEVEL SECURITY

alter table public.profiles            enable row level security;
alter table public.project_requests    enable row level security;
alter table public.request_updates     enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.newsletter          enable row level security;
alter table public.project_milestones  enable row level security;

-- profiles
drop policy if exists "profiles_select_own"   on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_own"   on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_select_own"   on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_select_admin" on public.profiles for select to authenticated using (public.is_admin());
create policy "profiles_update_own"   on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- project_requests
drop policy if exists "requests_select_own"   on public.project_requests;
drop policy if exists "requests_select_admin" on public.project_requests;
drop policy if exists "requests_insert_own"   on public.project_requests;
drop policy if exists "requests_update_own"   on public.project_requests;
drop policy if exists "requests_update_admin" on public.project_requests;
drop policy if exists "requests_delete_admin" on public.project_requests;
create policy "requests_select_own"   on public.project_requests for select to authenticated using (auth.uid() = user_id);
create policy "requests_select_admin" on public.project_requests for select to authenticated using (public.is_admin());
create policy "requests_insert_own"   on public.project_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "requests_update_own"   on public.project_requests for update to authenticated
  using (auth.uid() = user_id and status = 'new') with check (auth.uid() = user_id);
create policy "requests_update_admin" on public.project_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "requests_delete_admin" on public.project_requests for delete to authenticated using (public.is_admin());
drop policy if exists "requests_insert_admin" on public.project_requests;
create policy "requests_insert_admin" on public.project_requests for insert to authenticated with check (public.is_admin());

-- project_milestones: clients read their own project's milestones; admins manage all.
drop policy if exists "milestones_select_own"   on public.project_milestones;
drop policy if exists "milestones_admin_all"    on public.project_milestones;
create policy "milestones_select_own" on public.project_milestones for select to authenticated
  using (exists (select 1 from public.project_requests r where r.id = request_id and r.user_id = auth.uid()));
create policy "milestones_admin_all" on public.project_milestones for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- request_updates
drop policy if exists "updates_select_own"   on public.request_updates;
drop policy if exists "updates_select_admin" on public.request_updates;
drop policy if exists "updates_insert_admin" on public.request_updates;
create policy "updates_select_own" on public.request_updates for select to authenticated
  using (is_internal = false and exists (
    select 1 from public.project_requests r where r.id = request_id and r.user_id = auth.uid()));
create policy "updates_select_admin" on public.request_updates for select to authenticated using (public.is_admin());
create policy "updates_insert_admin" on public.request_updates for insert to authenticated with check (public.is_admin());

-- contact_submissions: anyone can submit (validated by CHECKs + flood trigger); only admins read.
drop policy if exists "contact_insert_anon"  on public.contact_submissions;
drop policy if exists "contact_select_admin" on public.contact_submissions;
create policy "contact_insert_anon"  on public.contact_submissions for insert to anon, authenticated with check (true);
create policy "contact_select_admin" on public.contact_submissions for select to authenticated using (public.is_admin());

-- newsletter: anyone can subscribe, only admins read. No public UPDATE, or anyone
-- could unsubscribe everyone.
drop policy if exists "newsletter_insert_anon"  on public.newsletter;
drop policy if exists "newsletter_select_admin" on public.newsletter;
drop policy if exists "newsletter_update_own"   on public.newsletter;
create policy "newsletter_insert_anon"  on public.newsletter for insert to anon, authenticated with check (status = 'active');
create policy "newsletter_select_admin" on public.newsletter for select to authenticated using (public.is_admin());

--  ADMIN VIEW
--  security_invoker makes the caller's RLS apply. Without it the view runs as
--  its owner and would expose every request.

drop view if exists public.admin_requests_view;
create view public.admin_requests_view
with (security_invoker = true) as
select
  r.id, r.project_name, r.service_type, r.status, r.priority, r.budget_range, r.timeline,
  r.start_date, r.target_date, r.progress, r.archived, r.created_at, r.updated_at,
  p.full_name as client_name, p.email as client_email, p.company as client_company,
  (select count(*) from public.request_updates u where u.request_id = r.id) as update_count
from public.project_requests r
join public.profiles p on p.id = r.user_id;

--  PRIVILEGES (RLS decides rows, grants decide tables)

revoke all on all tables    in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated, public;
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated, public;

grant usage on schema public to anon, authenticated;
grant insert on public.contact_submissions, public.newsletter to anon;
grant select, insert, update, delete on
  public.profiles, public.project_requests, public.request_updates,
  public.contact_submissions, public.newsletter, public.project_milestones to authenticated;
grant select on public.admin_requests_view to authenticated;
-- Signed-in users evaluate these inside policies and guard triggers; anon never does.
grant execute on function public.is_admin(), public.is_privileged_role() to authenticated;

--  MAKE YOURSELF ADMIN (run once, after signing up on the site):
--
--    update public.profiles set role = 'admin' where email = 'ammar@ivorystudios.io';
--
--  (Runs as the SQL-editor role, which is allowed to change roles; clients cannot.)
