/*
   Marketing / ads readiness — consent-gated, off until you add IDs.
   1) Fill in the IDs below (leave '' to keep a tag off).
   2) Deploy. A cookie banner appears; nothing loads until "Accept".
   Conversions fired: generate_lead (contact form), schedule (Calendly booking).
   Campaign parameters (utm_*, gclid, fbclid …) are kept for the session and
   attached to enquiries so you can see which ad produced which lead.
*/
(function () {
  const CONFIG = {
    GA4_ID: '',            // e.g. 'G-XXXXXXXXXX'
    GOOGLE_ADS_ID: '',     // e.g. 'AW-XXXXXXXXX'
    GOOGLE_ADS_LEAD_LABEL: '',     // e.g. 'AbC-D_efG-h12_34-5' → sends the Lead conversion
    GOOGLE_ADS_SCHEDULE_LABEL: '', // conversion label for booked calls
    META_PIXEL_ID: '',     // e.g. '1234567890'
  };

  const KEY = 'ivory-consent';
  const enabled = Object.values(CONFIG).some(Boolean);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* blocked */ } },
  };

  /* ─ Attribution (first-party, session only) ─ */
  const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid'];
  try {
    const q = new URLSearchParams(location.search);
    const found = PARAMS.filter(p => q.has(p)).map(p => `${p}=${q.get(p).slice(0, 100)}`);
    if (found.length && !sessionStorage.getItem('ivory-attr')) {
      const ref = document.referrer ? new URL(document.referrer).hostname : '';
      sessionStorage.setItem('ivory-attr', [...found, `landing=${location.pathname}`, ref && `ref=${ref}`].filter(Boolean).join('&'));
    }
  } catch { /* storage blocked */ }
  window.ivoryAttribution = () => { try { return sessionStorage.getItem('ivory-attr') || ''; } catch { return ''; } };

  /* ─ Tag loaders ─ */
  const load = src => { const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); };
  let loaded = false;
  function loadTags() {
    if (loaded || !enabled) return;
    loaded = true;
    const gId = CONFIG.GA4_ID || CONFIG.GOOGLE_ADS_ID;
    if (gId) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      load('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gId));
      window.gtag('js', new Date());
      if (CONFIG.GA4_ID) window.gtag('config', CONFIG.GA4_ID, { anonymize_ip: true });
      if (CONFIG.GOOGLE_ADS_ID) window.gtag('config', CONFIG.GOOGLE_ADS_ID);
    }
    if (CONFIG.META_PIXEL_ID) {
      const n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!window._fbq) window._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      load('https://connect.facebook.net/en_US/fbevents.js');
      n('init', CONFIG.META_PIXEL_ID);
      n('track', 'PageView');
    }
  }

  const consent = () => store.get(KEY);
  window.ivoryTrack = function (event, params = {}) {
    document.dispatchEvent(new CustomEvent('ivory:conversion', { detail: { event, params } }));
    if (consent() !== 'granted') return;
    if (window.gtag) {
      window.gtag('event', event, params);
      const label = event === 'generate_lead' ? CONFIG.GOOGLE_ADS_LEAD_LABEL : event === 'schedule' ? CONFIG.GOOGLE_ADS_SCHEDULE_LABEL : '';
      if (CONFIG.GOOGLE_ADS_ID && label) window.gtag('event', 'conversion', { send_to: `${CONFIG.GOOGLE_ADS_ID}/${label}` });
    }
    if (window.fbq) window.fbq('track', event === 'generate_lead' ? 'Lead' : event === 'schedule' ? 'Schedule' : event, params);
  };

  // Calendly posts a message to the page when a booking completes.
  window.addEventListener('message', e => {
    if (e.origin === 'https://calendly.com' && e.data && e.data.event === 'calendly.event_scheduled') {
      window.ivoryTrack('schedule', { provider: 'calendly' });
    }
  });

  /* ─ Consent banner (only when something is configured) ─ */
  function showBanner() {
    if (document.getElementById('consent-banner')) return;
    const box = document.createElement('div');
    box.id = 'consent-banner';
    box.className = 'consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Cookie preferences');
    const p = document.createElement('p');
    p.append('We use cookies to measure and improve our marketing. Nothing loads unless you accept. ');
    const a = document.createElement('a'); a.href = '/privacy'; a.textContent = 'Privacy policy'; p.append(a);
    const row = document.createElement('div'); row.className = 'consent-actions';
    const mk = (label, cls, value) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = label;
      b.addEventListener('click', () => { store.set(KEY, value); box.remove(); if (value === 'granted') loadTags(); });
      return b;
    };
    row.append(mk('Decline', 'btn-ghost btn-sm', 'denied'), mk('Accept', 'btn-primary btn-sm', 'granted'));
    box.append(p, row);
    document.body.appendChild(box);
  }

  function init() {
    document.querySelectorAll('[data-consent-open]').forEach(b => {
      if (!enabled) { b.remove(); return; }
      b.addEventListener('click', showBanner);
    });
    if (!enabled) return;
    if (consent() === 'granted') loadTags();
    else if (!consent()) showBanner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
