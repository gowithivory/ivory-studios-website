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

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
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

  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    ham.classList.remove('open');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  }));
})();

/* ─── Scroll reveal (IntersectionObserver) ──────────────────── */
(function initScrollReveal() {
  const selectors = '.reveal-up, .reveal-right';
  const els = document.querySelectorAll(selectors);
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el    = e.target;
      const delay = parseInt(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('visible'), delay);
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
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

/* ─── Service item – expand on click (mobile) ──────────────── */
document.querySelectorAll('.service-item').forEach(item => {
  item.addEventListener('click', () => {
    const link = `#contact`;
    const href = document.querySelector(link);
    if (href) {
      const navH = 68;
      window.scrollTo({ top: href.offsetTop - navH, behavior: 'smooth' });
    }
  });
});

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
