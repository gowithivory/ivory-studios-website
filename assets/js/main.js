// Site-wide interactions: loader, cursor, nav, reveals, counters, Calendly.

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(pointer: fine)').matches;
const CALENDLY_URL = 'https://calendly.com/ammar-ivorystudios/30min';

// Loader (home page only). Shown once per tab session so repeat visits go
// straight to the content. Timer-based on purpose: a slow image or third-party
// script should never keep the hero hidden.
function startLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return revealHero();

  let seen = false;
  try { seen = sessionStorage.getItem('ivory-loader') === '1'; sessionStorage.setItem('ivory-loader', '1'); } catch {}

  if (seen || REDUCE_MOTION) {
    loader.remove();
    return revealHero();
  }
  setTimeout(() => {
    loader.classList.add('done');
    revealHero();
    setTimeout(() => loader.remove(), 600);
  }, 700);
}

function revealHero() {
  document.querySelectorAll('.ht-line, .reveal-fade').forEach(el => {
    setTimeout(() => el.classList.add('visible'), parseInt(el.dataset.delay || 0, 10));
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startLoader);
else startLoader();

// Custom cursor, mouse users only.
(function cursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring || !FINE_POINTER || REDUCE_MOTION) return;
  document.documentElement.classList.add('has-custom-cursor');

  let mx = -100, my = -100, rx = -100, ry = -100;
  const place = (el, x, y) => { el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`; };

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    place(dot, mx, my);
  });

  (function follow() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    place(ring, rx, ry);
    requestAnimationFrame(follow);
  })();

  const grow = on => {
    dot.style.width = dot.style.height = on ? '10px' : '6px';
    ring.style.width = ring.style.height = on ? '56px' : '36px';
    ring.style.borderColor = on ? 'rgba(240,230,211,.7)' : 'rgba(240,230,211,.5)';
  };
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, summary, .work-card, .service-item, .testi-card')) grow(true);
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, summary, .work-card, .service-item, .testi-card')) grow(false);
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = ring.style.opacity = '1'; });
})();

// Nav background on scroll.
(function nav() {
  const el = document.getElementById('nav');
  if (!el) return;
  const update = () => el.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// Mobile menu.
(function mobileMenu() {
  const ham = document.getElementById('nav-ham');
  const menu = document.getElementById('mobile-menu');
  if (!ham || !menu) return;

  const setOpen = open => {
    ham.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', String(open));
    ham.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };

  ham.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) { setOpen(false); ham.focus(); }
  });
})();

// Calendly. The widget (~200 KB) is only fetched the first time someone clicks
// a [data-calendly] link. If it can't load, the link just goes to /contact.
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
    setTimeout(reject, 6000);
  }).catch(() => { calendlyLoading = null; throw new Error('calendly'); });
  return calendlyLoading;
}

document.addEventListener('click', e => {
  const link = e.target.closest('[data-calendly]');
  if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  link.setAttribute('aria-busy', 'true');
  loadCalendly()
    .then(() => window.Calendly.initPopupWidget({ url: CALENDLY_URL }))
    .catch(() => { window.location.href = link.getAttribute('href') || '/contact'; })
    .finally(() => link.removeAttribute('aria-busy'));
});

// Warm the Calendly script when someone shows intent, so the popup opens fast.
document.addEventListener('pointerover', e => {
  if (e.target.closest?.('[data-calendly]')) loadCalendly().catch(() => {});
}, { passive: true });

// Scroll reveals. IntersectionObserver does the work; the scroll sweep and the
// timeout are there so nothing can stay invisible if IO misbehaves.
(function scrollReveal() {
  const els = [...document.querySelectorAll('.reveal-up, .reveal-right')];
  if (!els.length) return;

  const show = el => el.classList.add('visible');
  if (REDUCE_MOTION) return els.forEach(show);

  const pending = new Set(els);
  const reveal = el => {
    if (!pending.delete(el)) return;
    const d = parseInt(el.dataset.delay || 0, 10);
    d ? setTimeout(() => show(el), d) : show(el);
  };

  let ticking = false;
  const sweep = () => {
    const h = window.innerHeight;
    pending.forEach(el => { if (el.getBoundingClientRect().top < h * 0.92) reveal(el); });
    if (!pending.size) window.removeEventListener('scroll', onScroll);
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; sweep(); });
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { reveal(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  sweep();
  setTimeout(() => els.forEach(show), 4000);
})();

// Count-up stats.
(function counters() {
  const els = document.querySelectorAll('.stat-num[data-target]');
  if (!els.length) return;

  const run = el => {
    const target = parseInt(el.dataset.target, 10);
    if (REDUCE_MOTION) { el.textContent = target; return; }
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / 1600, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      run(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
})();

// Card tilt + magnetic buttons (mouse only).
if (FINE_POINTER && !REDUCE_MOTION) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.35}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

// In-page anchors. Moves focus too, so the skip link works for keyboard users.
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 68;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: REDUCE_MOTION ? 'auto' : 'smooth' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});

// Pause the marquee on hover.
const marquee = document.querySelector('.marquee-wrap');
const track = document.querySelector('.marquee-track');
if (marquee && track) {
  marquee.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
  marquee.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
}

// Fade work images in once they've loaded.
document.querySelectorAll('.wc-img img').forEach(img => {
  if (img.complete && img.naturalWidth) return;
  img.style.opacity = '0';
  img.style.transition = 'opacity .5s ease';
  const done = () => { img.style.opacity = '1'; };
  img.addEventListener('load', done, { once: true });
  img.addEventListener('error', done, { once: true });
});
