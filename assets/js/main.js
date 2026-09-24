/* ═══════════════════════════════════════════════════════════
   Ivory Studios — main.js
   Cursor · Loader · Nav · Scroll reveal · Counter · Tilt · Magnetic
   ═══════════════════════════════════════════════════════════ */

// Honour the OS "reduce motion" setting — skips the heavier effects
// (custom cursor, 3D tilt, magnetic, count-up) for comfort + low-end devices.
const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── Page loader ──────────────────────────────────────────────
   Driven by a fixed timer, not window.load — so a slow image or the
   Calendly embed can never leave the loader (or the hero) stuck. */
function startLoader() {
  const loader = document.getElementById('loader');
  if (!loader) { triggerHeroText(); return; }   // sub-pages have no loader
  setTimeout(() => {
    loader.classList.add('done');
    triggerHeroText();
    setTimeout(() => loader.remove(), 600);
  }, 800);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startLoader);
else startLoader();

/* ─── Hero title reveal ─────────────────────────────────────── */
function triggerHeroText() {
  document.querySelectorAll('.ht-line').forEach(el => {
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('visible'), delay);
  });
  document.querySelectorAll('.reveal-fade').forEach(el => {
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('visible'), delay);
  });
}

/* ─── Custom cursor ─────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Only take over the cursor on real mouse devices. On touch / coarse
  // pointers (or reduced-motion) we leave the native cursor alone.
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (!finePointer || REDUCE_MOTION) return;
  document.documentElement.classList.add('has-custom-cursor');

  // Move via transform (not left/top) so tracking is compositor-only —
  // no layout or paint per mousemove, stays smooth even mid-scroll.
  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  const place = (el, x, y) =>
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    place(dot, mouseX, mouseY);
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    place(ring, ringX, ringY);
    requestAnimationFrame(animateRing);
  })();

  // Scale up cursor on interactive elements
  document.querySelectorAll('a, button, .work-card, .service-item, .testi-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width = '10px';
      dot.style.height = '10px';
      ring.style.width = '56px';
      ring.style.height = '56px';
      ring.style.borderColor = 'rgba(240,230,211,.7)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width = '6px';
      dot.style.height = '6px';
      ring.style.width = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'rgba(240,230,211,.5)';
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

/* ─── Nav scroll behaviour ──────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─── Mobile menu ───────────────────────────────────────────── */
(function initMobileMenu() {
  const ham  = document.getElementById('nav-ham');
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

/* ─── Calendly popup ────────────────────────────────────────────
   Any element with [data-calendly] opens the booking popup. If the widget
   hasn't loaded (blocked / offline) the link falls through to /contact. */
document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-calendly]');
  if (!trigger || !window.Calendly) return;
  e.preventDefault();
  window.Calendly.initPopupWidget({ url: 'https://calendly.com/ammar-ivorystudios/30min' });
});

/* ─── Scroll reveal — robust by design ──────────────────────────
   Content must NEVER stay invisible. We layer three mechanisms:
   1) IntersectionObserver (efficient, animates on scroll),
   2) a passive scroll fallback (covers devices/cases where IO is slow
      or never fires), and
   3) an absolute safety net that reveals everything after a few seconds.
   Above-the-fold elements reveal immediately. */
(function initScrollReveal() {
  const els = [...document.querySelectorAll('.reveal-up, .reveal-right')];
  if (!els.length) return;

  const show = el => el.classList.add('visible');
  if (REDUCE_MOTION) { els.forEach(show); return; }   // no animation, just show

  const pending = new Set(els);
  const reveal = el => {
    if (!pending.has(el)) return;
    pending.delete(el);
    const d = parseInt(el.dataset.delay || 0);
    d ? setTimeout(() => show(el), d) : show(el);
  };

  const sweep = () => {
    const h = window.innerHeight;
    pending.forEach(el => { if (el.getBoundingClientRect().top < h * 0.92) reveal(el); });
    if (!pending.size) window.removeEventListener('scroll', onScroll);
  };
  let ticking = false;
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
  sweep();                                            // reveal whatever's already in view
  setTimeout(() => els.forEach(show), 4000);          // absolute safety net
})();

/* ─── Animated counters ─────────────────────────────────────── */
(function initCounters() {
  const els = document.querySelectorAll('.stat-num[data-target]');
  if (!els.length) return;

  const ease = t => 1 - Math.pow(1 - t, 3);

  const animate = el => {
    const target = parseInt(el.dataset.target);
    if (REDUCE_MOTION) { el.textContent = target; return; }   // no count-up
    const duration = 1600;
    const start    = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(ease(p) * target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animate(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  els.forEach(el => io.observe(el));
})();

/* ─── Portfolio card 3D tilt ────────────────────────────────── */
(function initTilt() {
  if (REDUCE_MOTION || !window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - 0.5;
      const y  = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ─── Magnetic buttons ──────────────────────────────────────── */
(function initMagnetic() {
  if (REDUCE_MOTION || !window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.35;
      const y = (e.clientY - r.top  - r.height / 2) * 0.35;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ─── Smooth anchor scrolling ───────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
    window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
  });
});

/* ─── Marquee pause on hover ────────────────────────────────── */
const marquee = document.querySelector('.marquee-wrap');
const track   = document.querySelector('.marquee-track');
if (marquee && track) {
  marquee.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  marquee.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
}

/* ─── Lazy image fade-in ─────────────────────────────────────── */
(function initImageFade() {
  const applyFade = img => {
    img.style.transition = 'opacity .5s ease, filter .5s ease';
    img.style.opacity = '0';
    const onLoad = () => { img.style.opacity = '1'; };
    if (img.complete && img.naturalWidth) { img.style.opacity = '1'; return; }
    img.addEventListener('load', onLoad, { once: true });
    img.addEventListener('error', onLoad, { once: true });
  };
  document.querySelectorAll('.wc-img img, .hc-img img').forEach(applyFade);
})();
