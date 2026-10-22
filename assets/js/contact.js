// Contact form -> Supabase contact_submissions.
// If the insert fails we open a pre-filled email instead, so no enquiry is lost.
import { supabase, isConfigured, friendly } from './supabase.js';

const form = document.getElementById('inquiry-form');
if (form) {
  const status = document.getElementById('iform-status');
  const btn = form.querySelector('button[type=submit]');
  const EMAIL = 'teams@ivorystudios.io';
  const BUDGETS = {
    'under-1k': 'Under $1,000', '1k-3k': '$1,000 – $3,000', '3k-7k': '$3,000 – $7,000',
    '7k-15k': '$7,000 – $15,000', '15k+': '$15,000+',
  };

  const say = (msg, ok = false) => {
    status.textContent = msg;
    status.className = 'auth-note ' + (ok ? 'ok' : 'err');
    status.hidden = false;
  };

  // Field-level errors, announced via aria-describedby.
  const RULES = {
    name: v => v.length >= 2 || 'Please enter your name.',
    email: v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || 'Enter a valid email address, like name@company.com.',
    message: v => v.length >= 10 || 'Tell us a little more about the project (at least 10 characters).',
  };
  const check = input => {
    const rule = RULES[input.name];
    if (!rule) return true;
    const res = rule(input.value.trim());
    const err = document.getElementById(`${input.id}-err`);
    const bad = res !== true;
    input.setAttribute('aria-invalid', String(bad));
    if (err) err.textContent = bad ? res : '';
    return !bad;
  };
  Object.keys(RULES).forEach(name => {
    const input = form.elements[name];
    input.addEventListener('blur', () => { if (input.value) check(input); });
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') check(input); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = form.elements;
    if (f.website.value) return;                       // honeypot

    const invalid = Object.keys(RULES).map(n => f[n]).filter(input => !check(input));
    if (invalid.length) {
      say(invalid.length === 1 ? 'Please fix the highlighted field.' : `Please fix the ${invalid.length} highlighted fields.`);
      invalid[0].focus();
      return;
    }

    const name = f.name.value.trim();
    const email = f.email.value.trim();
    const message = f.message.value.trim();
    const services = [...form.querySelectorAll('input[name=services]:checked')].map(i => i.value).join(', ');
    const budget = BUDGETS[f.budget.value] || '';
    const attribution = (window.ivoryAttribution?.() || '').slice(0, 400);
    const row = {
      name, email,
      company: f.company.value.trim() || null,
      service: services || null,
      message: (budget ? `[Budget: ${budget}]\n` : '') + message + (attribution ? `\n\n[Source: ${attribution}]` : ''),
      source: 'website-contact',
    };

    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    status.hidden = true;
    try {
      if (!isConfigured) throw new Error('not configured');
      const { error } = await supabase.from('contact_submissions').insert(row);
      if (error) throw error;
      window.ivoryTrack?.('generate_lead', { form: 'contact' });
      form.reset();
      say(`Thanks, ${name.split(' ')[0]}. Your brief is in and we'll reply within one working day.`, true);
    } catch (err) {
      const body = `${row.message}\n\n— ${name}${row.company ? ', ' + row.company : ''}\n${email}${services ? '\nInterested in: ' + services : ''}`;
      const href = `mailto:${EMAIL}?subject=${encodeURIComponent('Project enquiry from ' + name)}&body=${encodeURIComponent(body)}`;
      const reason = isConfigured && !/fetch|network|load failed/i.test(String(err?.message || err)) ? friendly(err) : '';
      say(reason
        ? `${reason} Your email app is opening with your brief filled in, so nothing is lost.`
        : `We couldn't send this from the website, so we're opening your email app with your brief filled in. If nothing opens, email ${EMAIL}.`);
      window.location.href = href;
    } finally {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
    }
  });
}
