# Supabase setup

Free tier is enough. Takes about five minutes.

> The project the site currently points at (`jsqybmwsjcunjyjijlgt`) doesn't resolve any more, so login,
> signup, the portal and the enquiry inbox are down until a new project is set up. The contact form
> falls back to a pre-filled email in the meantime.

## 1. Project
1. supabase.com > New project. Pick the region closest to your clients.
2. Project Settings > API: copy the Project URL and the anon public key into the two constants at the top
   of `assets/js/supabase.js`. Never put the `service_role` key in this repo.

## 2. Database
1. SQL Editor > New query > paste all of `schema.sql` > Run. Safe to re-run.
2. Sign up on the site with `ammar@ivorystudios.io`, confirm the email, then run:
   ```sql
   update public.profiles set role = 'admin' where email = 'ammar@ivorystudios.io';
   ```
   Only the SQL editor can change roles.

## 3. Auth settings
Authentication > URL Configuration:

| Setting | Value |
|---|---|
| Site URL | `https://ivorystudios.io` |
| Redirect URLs | `https://ivorystudios.io/dashboard`, `https://ivorystudios.io/reset-password`, `http://localhost:3001/**` |

Keep "Confirm email" on and set the minimum password length to at least 8.

## 4. Enquiry notifications
Enquiries go to `contact_submissions` and show under Website Enquiries in the dashboard. For an email per
enquiry: Database > Webhooks > Create, on INSERT into `contact_submissions`, pointing at a Zapier / Make /
n8n hook that emails you.

## 5. Free tier
- Projects pause after 7 days without API traffic. A daily ping from UptimeRobot or cron-job.org to
  `https://<project>.supabase.co/rest/v1/` with the anon key in an `apikey` header keeps it awake.
- Take a backup now and then (Database > Backups).

## Tests
`npm run test:db` loads `schema.sql` into an in-memory Postgres and checks the access rules. Run it after
any schema change.

| Table | Read | Write |
|---|---|---|
| profiles | own row, admin all | own row (role and email locked), admin all |
| project_requests | own, admin all | client inserts own (status forced to `new`), edits while `new`, admin all |
| request_updates | own non-internal, admin all | admin only |
| contact_submissions | admin only | anyone, validated and rate-limited |
| newsletter | admin only | anyone can subscribe |
| admin_requests_view | admin only | none |
