// Login, signup and password reset. Each block only runs if its form is on the page.
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

// Where confirmation emails send people back to. Fixed, never taken from the URL.
const CONFIRM_REDIRECT = `${location.origin}/login?confirmed=1`;

// Arriving on /login from a confirmation email. Supabase has already checked
// the token by the time we get here: success comes back as #...type=signup with
// a session, failure as #error=... We report which one honestly, then ask the
// person to sign in with their password.
const authHash = new URLSearchParams(location.hash.slice(1));
const fromConfirmLink = /^\/login/.test(location.pathname) && (authHash.get('type') === 'signup' || (authHash.get('error') && new URLSearchParams(location.search).has('confirmed')));

async function handleConfirmation() {
  const note = $('#auth-note');
  if (authHash.get('error')) {
    history.replaceState(null, '', '/login');
    const expired = /expired|otp/i.test(`${authHash.get('error_code')} ${authHash.get('error_description')}`);
    notify(note, expired
      ? 'That confirmation link has expired or was already used. Enter your email below and send yourself a new one.'
      : "We couldn’t confirm your email with that link. Enter your email below and send yourself a new one.");
    $('#resend-wrap')?.removeAttribute('hidden');
    return;
  }
  // Let the client read the token from the URL before tidying the address bar.
  const { data } = await supabase.auth.getSession();
  history.replaceState(null, '', '/login');
  if (data.session?.user?.email_confirmed_at) {
    const email = data.session.user.email;
    await supabase.auth.signOut({ scope: 'local' });
    const field = $('#li-email');
    if (field) field.value = email;
    notify(note, 'Your email is confirmed. Log in with your password to open your workspace.', true);
    $('#li-pass')?.focus();
  } else {
    notify(note, "We couldn’t confirm your email with that link. Enter your email below and send yourself a new one.");
    $('#resend-wrap')?.removeAttribute('hidden');
  }
}

if (isConfigured && fromConfirmLink) {
  handleConfirmation();
} else if (isConfigured) {
  // Already signed in: skip straight to the dashboard.
  supabase.auth.getSession().then(({ data }) => {
    if (data.session && /^\/(login|signup)/.test(location.pathname)) location.replace('/dashboard');
  });
}

// Resend the confirmation email (login page). Same reply whatever the outcome,
// so it can't be used to discover which emails have accounts.
$('#resend-btn')?.addEventListener('click', async () => {
  const note = $('#auth-note');
  const email = $('#li-email')?.value.trim() || '';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return notify(note, 'Enter your email address above first.');
  const btn = $('#resend-btn');
  btn.disabled = true;
  await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: CONFIRM_REDIRECT } }).catch(() => {});
  btn.disabled = false;
  notify(note, 'If that email has an unconfirmed account, a new confirmation link is on its way.', true);
});

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
      options: { data: { full_name: name }, emailRedirectTo: CONFIRM_REDIRECT },
    });
    setLoading(btn, false);

    if (error) {
      const m = (error.message || '').toLowerCase();
      if (m.includes('already registered') || m.includes('already exists'))
        return notify(note, 'That email already has an account. Try logging in instead.');
      return notify(note, friendly(error));
    }

    if (data.session) {
      // Email confirmation is off → we're already signed in.
      location.replace('/dashboard');
    } else {
      // Confirmation on → user must click the email link before logging in.
      notify(note, 'Account created. We have sent a confirmation link to your email; open it to activate your account, then log in.', true);
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
      if (m.includes('not confirmed')) {
        $('#resend-wrap')?.removeAttribute('hidden');
        return notify(note, 'Please confirm your email first. Check your inbox for the link.');
      }
      if (m.includes('invalid'))            return notify(note, 'Wrong email or password.');
      return notify(note, friendly(error));
    }
    location.replace('/dashboard');
  });
}

// Password reset: step 1 requests the email, step 2 sets the new password
// after the user comes back from the link.
const requestForm = $('#request-form');
const newpassForm = $('#newpass-form');
if (requestForm || newpassForm) {
  // An expired or already-used link comes back with the error in the hash
  // (e.g. #error=access_denied&error_code=otp_expired). Say so plainly and
  // leave the request form showing so a new link is one step away.
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.get('error')) {
    const expired = /expired|otp/i.test(`${hash.get('error_code')} ${hash.get('error_description')}`);
    notify($('#auth-note'), expired
      ? 'That reset link has expired or was already used. Enter your email to get a new one.'
      : "That reset link isn’t valid. Enter your email to get a new one.");
    history.replaceState(null, '', location.pathname);
  }
  if (isConfigured) {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') showNewPassStep();
    });
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
    // Same message either way so the form can't be used to check who has an account.
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
