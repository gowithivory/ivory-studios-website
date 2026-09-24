/* Login + signup. One file, both forms — whichever is on the page. */
import { supabase, isConfigured, friendly } from './supabase.js';

const $ = s => document.querySelector(s);

function notify(el, msg, ok = false) {
  if (!el) return;
  el.textContent = msg;
  el.className = 'auth-note ' + (ok ? 'ok' : 'err');
  el.style.display = 'block';
}

function setLoading(btn, on, label) {
  if (!btn) return;
  btn.disabled = on;
  btn.dataset.label ??= btn.textContent;
  btn.textContent = on ? 'Please wait…' : (label || btn.dataset.label);
}

// If already signed in, skip straight to the dashboard.
(async () => {
  if (!isConfigured) return;
  const { data } = await supabase.auth.getSession();
  if (data.session && /^\/(login|signup)/.test(location.pathname)) {
    location.replace('/dashboard');
  }
})();

// Sign up
const signupForm = $('#signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const note = $('#auth-note');
    const btn  = signupForm.querySelector('button[type=submit]');

    if (!isConfigured) return notify(note, 'Sign-in is temporarily unavailable. Please email teams@ivorystudios.io.');

    const name  = $('#su-name').value.trim();
    const email = $('#su-email').value.trim();
    const pass  = $('#su-pass').value;

    if (name.length < 2)  return notify(note, 'Please enter your name.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return notify(note, 'Enter a valid email address.');
    if (pass.length < 8)  return notify(note, 'Password must be at least 8 characters.');

    setLoading(btn, true);
    const { data, error } = await supabase.auth.signUp({
      email, password: pass,
      options: { data: { full_name: name } },
    });
    setLoading(btn, false);

    if (error) {
      const m = (error.message || '').toLowerCase();
      if (m.includes('already registered') || m.includes('already exists'))
        return notify(note, 'That email already has an account — try logging in instead.');
      return notify(note, friendly(error));
    }

    if (data.session) {
      // Email confirmation is off → we're already signed in.
      location.replace('/dashboard');
    } else {
      // Confirmation on → user must click the email link before logging in.
      notify(note, 'Account created! Check your email for a confirmation link, then log in.', true);
      signupForm.reset();
    }
  });
}

// Log in
const loginForm = $('#login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const note = $('#auth-note');
    const btn  = loginForm.querySelector('button[type=submit]');

    if (!isConfigured) return notify(note, 'Sign-in is temporarily unavailable. Please email teams@ivorystudios.io.');

    const email = $('#li-email').value.trim();
    const pass  = $('#li-pass').value;
    if (!email || !pass) return notify(note, 'Enter your email and password.');

    setLoading(btn, true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(btn, false);

    if (error) {
      const m = (error.message || '').toLowerCase();
      if (m.includes('not confirmed'))      return notify(note, 'Please confirm your email first — check your inbox for the link.');
      if (m.includes('invalid'))            return notify(note, 'Wrong email or password.');
      return notify(note, friendly(error));
    }
    location.replace('/dashboard');
  });
}

// Reset password
// reset-password.html shows two forms: request a link, then set a new
// password when the user arrives back from that emailed link.
const requestForm = $('#request-form');
const newpassForm = $('#newpass-form');
if (requestForm || newpassForm) {
  // When the recovery email link is opened, supabase-js establishes a
  // temporary session and fires PASSWORD_RECOVERY — swap to step 2.
  if (isConfigured) {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') showNewPassStep();
    });
    // Also handle the case where the session is already present on load.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && location.hash.includes('type=recovery')) showNewPassStep();
    });
  }
}

function showNewPassStep() {
  const req = $('#request-form'), np = $('#newpass-form');
  if (req) req.hidden = true;
  if (np)  np.hidden = false;
}

if (requestForm) {
  requestForm.addEventListener('submit', async e => {
    e.preventDefault();
    const note = $('#auth-note');
    const btn  = requestForm.querySelector('button[type=submit]');
    if (!isConfigured) return notify(note, 'Sign-in is temporarily unavailable. Please email teams@ivorystudios.io.');

    const email = $('#rp-email').value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return notify(note, 'Enter a valid email address.');

    setLoading(btn, true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: location.origin + '/reset-password',
    });
    setLoading(btn, false);
    // Always show success — don't reveal whether an email is registered.
    notify(note, "If that email has an account, a reset link is on its way. Check your inbox.", true);
    requestForm.reset();
  });
}

if (newpassForm) {
  newpassForm.addEventListener('submit', async e => {
    e.preventDefault();
    const note = $('#auth-note');
    const btn  = newpassForm.querySelector('button[type=submit]');
    if (!isConfigured) return notify(note, 'Sign-in is temporarily unavailable.');

    const pass = $('#rp-pass').value;
    if (pass.length < 8) return notify(note, 'Password must be at least 8 characters.');

    setLoading(btn, true);
    const { error } = await supabase.auth.updateUser({ password: pass });
    setLoading(btn, false);
    if (error) return notify(note, friendly(error));
    notify(note, 'Password updated. Redirecting you to the dashboard…', true);
    setTimeout(() => location.replace('/dashboard'), 1200);
  });
}
