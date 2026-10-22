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

// Readable message for an error. Only wording written for people is shown:
// network trouble, Supabase Auth's own messages, and the ones our database
// raises on purpose (P0001). Anything else can name tables or constraints,
// so it stays generic.
export function friendly(error) {
  const m = String(error?.message || error || '');
  if (/failed to fetch|network|load failed|fetch/i.test(m)) {
    return "We can't reach the server right now. Please try again in a moment, or email teams@ivorystudios.io.";
  }
  const authMessage = (error?.__isAuthError || /^Auth/.test(error?.name || '')) && !(error?.status >= 500);
  if (m && (error?.code === 'P0001' || authMessage)) return m;
  return 'Something went wrong on our side. Please try again, or email teams@ivorystudios.io.';
}
