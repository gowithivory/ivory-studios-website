// Supabase client. Setup steps are in supabase/SETUP.md.
// Only the public anon key belongs here. Never put the service_role key in
// front-end code, it bypasses row-level security.

const SUPABASE_URL  = 'https://jsqybmwsjcunjyjijlgt.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzcXlibXdzamN1bmp5amlqbGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzQyMzYsImV4cCI6MjA5NzM1MDIzNn0.we09QNNZIBSo9mAtU0iaGFclPpFMbOgV73MFK14yD50';

export const isConfigured =
  !SUPABASE_URL.includes('YOUR-PROJECT') && !SUPABASE_ANON.includes('YOUR-ANON') && !!window.supabase;

// supabase-js is self-hosted (pinned) at /assets/js/vendor/supabase.min.js.
export const supabase = isConfigured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

// Readable message for network failures.
export function friendly(error) {
  const m = String(error?.message || error || '');
  if (/failed to fetch|network|load failed|fetch/i.test(m)) {
    return "We can't reach the server right now. Please try again in a moment, or email teams@ivorystudios.io.";
  }
  return m || 'Something went wrong. Please try again.';
}
