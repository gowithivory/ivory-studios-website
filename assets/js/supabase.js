// Supabase client. Setup steps are in supabase/SETUP.md.
// Only the publishable key belongs here: it is public by design, and
// row-level security decides what it can do. Never put a secret
// (sb_secret_…) or service_role key in front-end code, it bypasses RLS.

const SUPABASE_URL  = 'https://lpsixmkqeaydxpqytuiw.supabase.co';
const SUPABASE_ANON = 'sb_publishable_MwooCsC-ND_9mi5_9BWswg_i45I_XzN';

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
