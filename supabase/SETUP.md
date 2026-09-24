# Supabase setup — Ivory Studios (free tier)

> **Status:** the Supabase project this site was pointed at (`jsqybmwsjcunjyjijlgt`) no longer resolves
> (DNS `NXDOMAIN`), so login, signup, the client portal and the enquiry inbox are offline until you
> create a new project. Until then the contact form falls back to opening a pre-filled email, so
> no enquiry is lost. Everything below takes about 5 minutes and costs nothing.

## 1. Create the project
1. https://supabase.com → **New project** (free plan). Pick the region closest to your clients.
2. **Project Settings → API**: copy the **Project URL** and the **anon / public** key.
3. Paste them into the two constants at the top of `assets/js/supabase.js`.
   Never paste the `service_role` key anywhere in this repo.

## 2. Create the database
1. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**. Safe to re-run.
2. Sign up once on the live site (or locally) with `ammar@ivorystudios.io`, confirm the email, then run:
   ```sql
   update public.profiles set role = 'admin' where email = 'ammar@ivorystudios.io';
   ```
   Only the SQL editor can do this — clients cannot promote themselves.

## 3. Auth settings (Authentication → URL Configuration / Providers)
| Setting | Value |
|---|---|
| Site URL | `https://ivorystudios.io` (no `www` — `www` redirects to the apex) |
| Redirect URLs | `https://ivorystudios.io/dashboard`, `https://ivorystudios.io/reset-password`, `http://localhost:3001/**` |
| Confirm email | **On** |
| Minimum password length | `8` (12 if you can) |

## 4. Get notified of new enquiries (free)
Website enquiries land in `contact_submissions` and show in **Dashboard → Website Enquiries** when
you're logged in as admin. To get an email for each one: **Database → Webhooks → Create** on
`contact_submissions` (INSERT) pointing at a free Zapier/Make/n8n webhook that emails you.

## 5. Free-tier gotchas
- Free projects **pause after 7 days without activity** and can be deleted later. Any visit that hits
  the API counts; if traffic is low, add a free uptime pinger (UptimeRobot / cron-job.org) hitting
  `https://<project>.supabase.co/rest/v1/` with the anon key in an `apikey` header once a day.
- Back up occasionally: **Database → Backups**, or `pg_dump` from the connection string.

## Verifying the security rules
`npm run test:db` spins up an in-memory Postgres, applies `schema.sql`, and asserts 30 access rules
(clients only see their own rows, cannot self-promote or change their own status, anonymous users can
only submit the contact form, the admin view doesn't leak, etc.). Run it after any schema change.

## RLS summary
| Table | Read | Write |
|---|---|---|
| profiles | own row; admin all | own row (role/email locked by trigger); admin all |
| project_requests | own; admin all | client inserts own (forced to `new`/`normal`); edits description while `new`; admin everything |
| request_updates | own, non-internal; admin all | admin only |
| contact_submissions | admin only | anyone (validated, flood-limited) |
| newsletter | admin only | anyone can subscribe; no public update/delete |
| admin_requests_view | admin only (`security_invoker`) | — |
