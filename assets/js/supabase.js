/* ───────────────────────────────────────────────────────────
   Supabase client (free tier is enough for this site)
   ---------------------------------------------------------------
   1. Create a project at https://supabase.com
   2. Project Settings → API → copy the Project URL and the
      "anon / public" key into the two constants below.
   3. SQL Editor → paste supabase/schema.sql → Run. See supabase/SETUP.md.

   SECURITY: only ever paste the ANON key here. The service_role
   key bypasses row-level security and must NEVER live in front-end code.
─────────────────────────────────────────────────────────────── */

const SUPABASE_URL  = 'https://jsqybmwsjcunjyjijlgt.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXlibXdzamN1bmp5amlqbGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzQyMzYsImV4cCI6MjA5NzM1MDIzNn0.we09QNNZIBSo9mAtU0iaGFclPpFMbOgV73MFK14yD50';

export const isConfigured =
  !SUPABASE_URL.includes('YOUR-PROJECT') && !SUPABASE_ANON.includes('YOUR-ANON') && !!window.supabase;

// The client library is self-hosted at /assets/js/vendor/supabase.min.js (pinned version).
export const supabase = isConfigured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

/* Turn low-level network failures into something a visitor can act on. */
export function friendly(error) {
  const m = String(error?.message || error || '');
  if (/failed to fetch|network|load failed|fetch/i.test(m)) {
    return "We can't reach the server right now. Please try again in a moment, or email teams@ivorystudios.io.";
  }
  return m || 'Something went wrong. Please try again.';
}
