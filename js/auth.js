/* Login + signup. One file, both forms — whichever is on the page. */
import { supabase, isConfigured } from './supabase.js';

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
  if (data.session && /login|signup/.test(location.pathname)) {
    location.replace('dashboard.html');
  }
})();

// ─── Sign up ────────────────────────────────────────────────
const signupForm = $('#signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const note = $('#auth-note');
    const btn  = signupForm.querySelector('button[type=submit]');

    if (!isConfigured) return notify(note, 'Backend not connected yet — add your Supabase keys in js/supabase.js.');

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
      return notify(note, error.message);
    }

    if (data.session) {
      // Email confirmation is off → we're already signed in.
      location.replace('dashboard.html');
    } else {
      // Confirmation on → user must click the email link before logging in.
      notify(note, 'Account created! Check your email for a confirmation link, then log in.', true);
      signupForm.reset();
    }
  });
}

// ─── Log in ─────────────────────────────────────────────────
const loginForm = $('#login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const note = $('#auth-note');
    const btn  = loginForm.querySelector('button[type=submit]');

    if (!isConfigured) return notify(note, 'Backend not connected yet — add your Supabase keys in js/supabase.js.');

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
      return notify(note, error.message);   // surface anything else (e.g. rate limits)
    }
    location.replace('dashboard.html');
  });
}
