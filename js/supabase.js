/* ───────────────────────────────────────────────────────────
   Supabase client
   ---------------------------------------------------------------
   1. Create a project at https://supabase.com  (free tier is fine)
   2. Project Settings → API → copy the Project URL and the
      "anon / public" key into the two constants below.
   3. SQL Editor → paste supabase/schema.sql → Run.

   SECURITY: only ever paste the ANON key here. The service_role
   key must NEVER live in front-end code — it bypasses every
   row-level-security rule. Keep it on a server you control.
─────────────────────────────────────────────────────────────── */

const SUPABASE_URL  = 'https://jsqybmwsjcunjyjijlgt.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXlibXdzamN1bmp5amlqbGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzQyMzYsImV4cCI6MjA5NzM1MDIzNn0.we09QNNZIBSo9mAtU0iaGFclPpFMbOgV73MFK14yD50';

export const isConfigured =
  !SUPABASE_URL.includes('YOUR-PROJECT') && !SUPABASE_ANON.includes('YOUR-ANON');

// global UMD build is loaded from the CDN in each <head>
export const supabase = isConfigured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

/* Small helper so pages can guard before touching the DB. */
export function requireConfig() {
  if (isConfigured) return true;
  console.warn('[Ivory] Supabase not configured — edit js/supabase.js');
  return false;
}
