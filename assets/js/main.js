// Site-wide interactions: nav, mobile menu, scroll reveals, Calendly.
// The hero animates with CSS alone, so nothing above the fold waits for this file.

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CALENDLY_URL = 'https://calendly.com/ammar-ivorystudios/30min';

// Hide reveal targets only once we know this script runs, so the page is
// fully readable without JavaScript.
document.documentElement.classList.add('js');

// Nav background on scroll.
(function nav() {
  const el = document.getElementById('nav');
  if (!el) return;
  let ticking = false;
  const update = () => { el.classList.toggle('scrolled', window.scrollY > 24); ticking = false; };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();

// Mobile menu: full-screen overlay with a focus trap and Escape to close.
(function mobileMenu() {
  const ham = document.getElementById('nav-ham');
  const menu = document.getElementById('mobile-menu');
  const nav = document.getElementById('nav');
  if (!ham || !menu) return;
  const desktop = window.matchMedia('(min-width: 961px)');

  const setOpen = open => {
    ham.setAttribute('aria-expanded', String(open));
    ham.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav?.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('open'));
    } else {
      menu.classList.remove('open');
      setTimeout(() => { if (!menu.classList.contains('open')) menu.hidden = true; }, REDUCE_MOTION ? 0 : 300);
    }
  };
  const isOpen = () => ham.getAttribute('aria-expanded') === 'true';

  ham.addEventListener('click', () => setOpen(!isOpen()));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', e => {
    if (!isOpen()) return;
    if (e.key === 'Escape') { setOpen(false); ham.focus(); return; }
    if (e.key !== 'Tab') return;
    const items = [ham, ...menu.querySelectorAll('a[href], button')];
    const i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
    else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
  });
  desktop.addEventListener?.('change', e => { if (e.matches && isOpen()) setOpen(false); });
})();

// Calendly. The widget (~200 KB) is only fetched when someone shows intent:
// hovering or clicking a [data-calendly] link, or reaching the booking panel on
// /contact. If it can't load, links just go to /contact.
let calendlyLoading = null;
function loadCalendly() {
  if (window.Calendly) return Promise.resolve();
  if (calendlyLoading) return calendlyLoading;
  calendlyLoading = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://assets.calendly.com/assets/external/widget.css';
    document.head.appendChild(css);

    const js = document.createElement('script');
    js.src = 'https://assets.calendly.com/assets/external/widget.js';
    js.async = true;
    js.onload = () => (window.Calendly ? resolve() : reject());
    js.onerror = reject;
    document.head.appendChild(js);
    setTimeout(reject, 8000);
  }).catch(() => { calendlyLoading = null; throw new Error('calendly'); });
  return calendlyLoading;
}

document.addEventListener('click', e => {
  const link = e.target.closest('[data-calendly]');
  if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  // On /contact the booking panel is on the page: scroll to it instead of a popup.
  const slot = document.getElementById('calendly-slot');
  if (slot) {
    e.preventDefault();
    slot.scrollIntoView({ behavior: REDUCE_MOTION ? 'auto' : 'smooth', block: 'center' });
    return;
  }
  e.preventDefault();
  link.setAttribute('aria-busy', 'true');
  loadCalendly()
    .then(() => window.Calendly.initPopupWidget({ url: CALENDLY_URL }))
    .catch(() => { window.location.href = link.getAttribute('href') || '/contact'; })
    .finally(() => link.removeAttribute('aria-busy'));
});

document.addEventListener('pointerover', e => {
  if (e.target.closest?.('[data-calendly]')) loadCalendly().catch(() => {});
}, { passive: true });

// Inline booking panel on /contact, loaded when it nears the viewport.
(function inlineCalendly() {
  const slot = document.getElementById('calendly-slot');
  if (!slot) return;
  const start = () => loadCalendly().then(() => {
    window.Calendly.initInlineWidget({ url: slot.dataset.calendlyInline, parentElement: slot });
    slot.classList.add('loaded');
  }).catch(() => {
    const p = slot.querySelector('.calendly-placeholder p');
    if (p) p.textContent = "The booking calendar couldn't load here.";
    slot.querySelector('.spinner')?.remove();
  });
  if (!('IntersectionObserver' in window)) return start();
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) { io.disconnect(); start(); }
  }, { rootMargin: '0px' });
  io.observe(slot);
})();

// Scroll reveals. Siblings in the same row are staggered slightly.
(function scrollReveal() {
  const els = [...document.querySelectorAll('.reveal-up')];
  if (!els.length) return;
  const show = el => el.classList.add('visible');
  if (REDUCE_MOTION || !('IntersectionObserver' in window)) return els.forEach(show);

  els.forEach(el => {
    const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal-up'));
    const i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty('--d', `${Math.min(i, 5) * 70}ms`);
  });

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { show(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(el => io.observe(el));

  // Anything already above the viewport (e.g. after a reload mid-page) shows at once.
  els.forEach(el => { if (el.getBoundingClientRect().bottom < 0) show(el); });
})();

// In-page anchors. Moves focus too, so the skip link works for keyboard users.
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id === '#') return;
  const target = document.querySelector(id);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: REDUCE_MOTION ? 'auto' : 'smooth', block: 'start' });
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  history.replaceState(null, '', id);
});
