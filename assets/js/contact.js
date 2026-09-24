/* Contact / brief form → Supabase `contact_submissions`.
   If the database is unreachable the visitor is handed a pre-filled email
   instead, so an enquiry is never lost. */
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
    status.style.display = 'block';
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = form.elements;
    if (f.website.value) return;                       // honeypot: bots fill it, people can't see it

    const name = f.name.value.trim();
    const email = f.email.value.trim();
    const message = f.message.value.trim();
    if (name.length < 2) return say('Please enter your name.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return say('Enter a valid email address.');
    if (message.length < 10) return say('Tell us a little more about the project (10+ characters).');

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
    try {
      if (!isConfigured) throw new Error('not configured');
      const { error } = await supabase.from('contact_submissions').insert(row);
      if (error) throw error;
      window.ivoryTrack?.('generate_lead', { form: 'contact' });
      form.reset();
      say("Thanks — your brief is in. We'll reply within 24 hours.", true);
    } catch (err) {
      const body = `${row.message}\n\n— ${name}${row.company ? ', ' + row.company : ''}\n${email}${services ? '\nInterested in: ' + services : ''}`;
      const href = `mailto:${EMAIL}?subject=${encodeURIComponent('Project enquiry from ' + name)}&body=${encodeURIComponent(body)}`;
      say((isConfigured ? friendly(err) : "Our online enquiry inbox isn't available right now.") + ' Opening your email app so you can send it directly…');
      window.location.href = href;
    } finally {
      btn.disabled = false;
    }
  });
}
