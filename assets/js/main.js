// Site-wide interactions: nav, mobile menu, scroll reveals, Calendly, and the
// pointer layer (cursor, 3D cards, magnetic buttons, spotlights).
// The hero animates with CSS alone, so nothing above the fold waits for this file.

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Mouse/trackpad users only: touch screens keep native behaviour.
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const RICH_POINTER = FINE_POINTER && !REDUCE_MOTION;
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
  const els = [...document.querySelectorAll('.reveal-up, .footer-sign, .proj-shot')];
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

// Count-up for the facts band. Final values are in the HTML, so the numbers
// are correct with JS off or reduced motion on.
(function counters() {
  const els = [...document.querySelectorAll('[data-count]')];
  if (!els.length || REDUCE_MOTION || !('IntersectionObserver' in window)) return;
  const run = el => {
    const target = +el.dataset.count;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = p < 1 ? Math.round((1 - Math.pow(1 - p, 4)) * target) : target;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { obs.unobserve(e.target); run(e.target); } });
  }, { threshold: 0.6 });
  els.forEach(el => {
    // Reserve the final width so nothing shifts as digits are added.
    el.style.minWidth = `${el.dataset.count.length}ch`;
    // Already on screen at load: keep the real value instead of flashing to 0.
    if (el.getBoundingClientRect().top < innerHeight) return;
    el.textContent = '0';
    io.observe(el);
  });
})();

// Signature cursor: a dot that tracks the pointer exactly and a ring that
// follows with a short delay. The native cursor is only hidden after the first
// real mouse move, so it can never disappear if this fails to start.
(function cursor() {
  if (!RICH_POINTER) return;
  const root = document.documentElement;
  const dot = Object.assign(document.createElement('div'), { className: 'cursor-dot' });
  const ring = Object.assign(document.createElement('div'), { className: 'cursor-ring' });
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');
  document.body.append(dot, ring);

  let mx = -100, my = -100, rx = -100, ry = -100, raf = 0;
  const place = () => {
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
  };
  const loop = () => {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    raf = Math.abs(mx - rx) + Math.abs(my - ry) > 0.1 ? requestAnimationFrame(loop) : 0;
  };
  const show = () => { if (!root.classList.contains('cursor-suspended')) root.classList.add('cursor-on'); };

  // Pick up where the pointer was on the previous page, so the cursor doesn't
  // vanish after every click until the mouse moves again.
  try {
    const last = JSON.parse(sessionStorage.getItem('ivory-cursor') || 'null');
    if (last && Date.now() - last.t < 5000 && last.x < innerWidth && last.y < innerHeight) {
      mx = rx = last.x; my = ry = last.y; place(); show();
    }
  } catch { /* storage blocked */ }
  window.addEventListener('pagehide', () => {
    try { sessionStorage.setItem('ivory-cursor', JSON.stringify({ x: mx, y: my, t: Date.now() })); } catch { /* storage blocked */ }
  });

  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    if (!root.classList.contains('cursor-on')) { rx = mx; ry = my; place(); show(); }
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });

  const STATES = ['cursor-link', 'cursor-view', 'cursor-text'];
  const setState = (state, label = '') => {
    STATES.forEach(c => root.classList.toggle(c, c === state));
    ring.dataset.label = label;
  };
  document.addEventListener('pointerover', e => {
    const t = e.target;
    if (t.closest('input, textarea, select, iframe, [contenteditable]')) return setState('cursor-text');
    const card = t.closest('.work-card, .hero-feature');
    if (card) return setState('cursor-view', card.classList.contains('is-concept') ? 'Study' : 'View');
    if (t.closest('a, button, summary, label, [role="button"]')) return setState('cursor-link');
    setState(null);
  }, { passive: true });
  document.addEventListener('pointerdown', () => root.classList.add('cursor-down'), { passive: true });
  document.addEventListener('pointerup', () => root.classList.remove('cursor-down'), { passive: true });
  root.addEventListener('mouseleave', () => root.classList.remove('cursor-on'));
  window.addEventListener('blur', () => root.classList.remove('cursor-on'));

  // Pointer events stop at an iframe's edge, so inside the Calendly popup the
  // custom cursor would freeze while the native one carries on. Step aside
  // completely (native cursor back) for as long as the overlay is open.
  const suspend = on => {
    root.classList.toggle('cursor-suspended', on);
    if (on) root.classList.remove('cursor-on');
  };
  new MutationObserver(() => suspend(!!document.querySelector('.calendly-overlay, .calendly-popup')))
    .observe(document.body, { childList: true });

  // Restored from the back/forward cache: clear states left from the click.
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    setState(null);
    root.classList.remove('cursor-down');
  });
})();

// 3D project cards. The card's rect is read once on enter; moves only write
// custom properties inside one rAF.
(function tilt() {
  if (!RICH_POINTER) return;
  const MAX = 5; // degrees
  document.querySelectorAll('.work-card, .hero-feature').forEach(card => {
    card.classList.add('tilt');
    const img = card.querySelector('img');
    let rect = null, raf = 0, px = 0, py = 0;
    const apply = () => {
      raf = 0;
      card.style.setProperty('--ry', `${(px - 0.5) * MAX * 2}deg`);
      card.style.setProperty('--rx', `${(0.5 - py) * MAX * 2}deg`);
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
      if (img) { img.style.setProperty('--px', `${(0.5 - px) * 14}px`); img.style.setProperty('--py', `${(0.5 - py) * 14}px`); }
    };
    card.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;
      rect = card.getBoundingClientRect();
      card.classList.add('is-tilting');
    });
    card.addEventListener('pointermove', e => {
      if (!rect) return;
      px = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      py = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      rect = null;
      if (raf) cancelAnimationFrame(raf), raf = 0;
      card.classList.remove('is-tilting');
      ['--rx', '--ry', '--mx', '--my'].forEach(p => card.style.removeProperty(p));
      img?.style.removeProperty('--px'); img?.style.removeProperty('--py');
    });
  });
  // Restored from the back/forward cache with the card mid-tilt: flatten it.
  window.addEventListener('pageshow', e => {
    if (e.persisted) document.querySelectorAll('.tilt.is-tilting').forEach(c => c.dispatchEvent(new PointerEvent('pointerleave')));
  });
  // Rects go stale when the page scrolls under a stationary pointer.
  window.addEventListener('scroll', () => document.querySelectorAll('.tilt.is-tilting').forEach(c => c.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }))), { passive: true });
})();

// Magnetic primary buttons: a restrained pull towards the pointer.
(function magnetic() {
  if (!RICH_POINTER) return;
  document.querySelectorAll('.btn-primary, .btn-nav').forEach(btn => {
    btn.classList.add('magnetic');
    let rect = null;
    btn.addEventListener('pointerenter', () => { rect = btn.getBoundingClientRect(); btn.classList.add('is-pulled'); });
    btn.addEventListener('pointermove', e => {
      if (!rect) return;
      const clamp = v => Math.max(-6, Math.min(6, v));
      btn.style.setProperty('--tx', `${clamp((e.clientX - rect.left - rect.width / 2) * 0.12)}px`);
      btn.style.setProperty('--ty', `${clamp((e.clientY - rect.top - rect.height / 2) * 0.25)}px`);
    }, { passive: true });
    btn.addEventListener('pointerleave', () => {
      rect = null;
      btn.classList.remove('is-pulled');
      btn.style.removeProperty('--tx'); btn.style.removeProperty('--ty');
    });
  });
  window.addEventListener('pageshow', e => {
    if (e.persisted) document.querySelectorAll('.magnetic.is-pulled').forEach(b => b.dispatchEvent(new PointerEvent('pointerleave')));
  });
})();

// Spotlight that follows the pointer across service and supporting cards.
(function spotlight() {
  if (!RICH_POINTER) return;
  let raf = 0, card = null, x = 0, y = 0;
  document.addEventListener('pointermove', e => {
    card = e.target.closest?.('.service-card, .related-service, .benefit-card, .value-card, .diff-item');
    if (!card) return;
    x = e.clientX; y = e.clientY;
    if (!raf) raf = requestAnimationFrame(() => {
      raf = 0;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${x - r.left}px`);
      card.style.setProperty('--my', `${y - r.top}px`);
    });
  }, { passive: true });
})();

// Hero depth: the featured project drifts a little slower than the page.
(function heroDrift() {
  const card = document.querySelector('.hero-feature');
  if (!card || REDUCE_MOTION || !window.matchMedia('(min-width: 900px)').matches) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const y = window.scrollY;
    if (y > window.innerHeight) return;
    // Down only (the card lags behind the page), so it can never rise into the headline.
    card.style.setProperty('--drift', `${Math.min(y * 0.06, 40)}px`);
  };
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
})();
