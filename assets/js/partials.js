/* ───────────────────────────────────────────────────────────
   Progressive enhancements for the static nav/footer (which are baked
   into every page by scripts/build.mjs, so crawlers and no-JS visitors
   get the full markup).
   1) Swap "Client Login" → "Dashboard" when a Supabase session exists.
   2) Service pages: inject the shared Process + social-proof section.
─────────────────────────────────────────────────────────────── */
(function () {
  const hasSession = (() => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!/^sb-.+-auth-token$/.test(key)) continue;
        const d = JSON.parse(localStorage.getItem(key));
        const exp = d?.expires_at ?? d?.currentSession?.expires_at;
        if (exp && exp * 1000 > Date.now()) return true;
      }
    } catch { /* storage blocked — treat as signed out */ }
    return false;
  })();

  if (hasSession) {
    document.querySelectorAll('[data-account]').forEach(a => {
      a.textContent = 'Dashboard';
      a.setAttribute('href', '/dashboard');
    });
  }

  if (document.querySelector('.service-hero')) {
    const faqSection = document.querySelector('.faq-wrap')?.closest('section');
    if (faqSection) {
      const arrow = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      const ico = {
        search: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
        design: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
        build:  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
        launch: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
      };
      const step = (n, t, d, tag, icon) =>
        `<div class="process-step reveal-up"><div class="ps-num">${n}</div><div class="ps-icon">${icon}</div><h3 class="ps-title">${t}</h3><p class="ps-desc">${d}</p><div class="ps-tag">${tag}</div></div>`;
      const conn = `<div class="process-connector reveal-fade"><div class="pc-line"></div>${arrow}</div>`;
      faqSection.insertAdjacentHTML('beforebegin', `
        <section class="section">
          <div class="container">
            <div class="section-header reveal-up"><div class="section-label">How We Work</div><h2 class="section-title">A clear, <span class="accent">proven</span> process</h2></div>
            <div class="process-steps">
              ${step('01', 'Discovery', 'We learn your goals, audience, and competition before a single pixel is drawn.', 'Week 1', ico.search)}
              ${conn}
              ${step('02', 'Design', 'You review and approve high-fidelity designs — no surprises at launch.', 'Weeks 2–3', ico.design)}
              ${conn}
              ${step('03', 'Build', 'Clean, fast, SEO-ready code — green Core Web Vitals, mobile-first.', 'Weeks 3–5', ico.build)}
              ${conn}
              ${step('04', 'Launch &amp; Grow', 'We launch, monitor, and optimise — with support and a growth partnership.', 'Week 6+', ico.launch)}
            </div>
          </div>
        </section>
        <section class="section dark-section">
          <div class="container svc-proof reveal-up">
            <div class="svc-proof-stars" aria-label="5 out of 5 stars">★★★★★</div>
            <p class="svc-proof-quote">"None of the agencies we tried before opened a discovery call with a conversion goal instead of a colour palette. Ivory did — and three months later our qualified leads are up 3×."</p>
            <div class="svc-proof-author">Ahmed Kamal · CEO, NovaTech Solutions</div>
            <div class="svc-proof-stats"><span><strong>50+</strong> projects</span><span><strong>30+</strong> clients</span><span><strong>98%</strong> satisfaction</span></div>
            <a href="/work" class="btn-ghost">See the results in our work ${arrow}</a>
          </div>
        </section>`);
    }
  }
})();
