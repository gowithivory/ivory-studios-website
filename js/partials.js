/* ───────────────────────────────────────────────────────────
   Shared chrome — nav + footer injected into every marketing page.
   Each page sets <body data-page="services"> etc. so the right link
   gets the active state. Runs before main.js so the cursor / mobile
   menu wiring finds these elements already in the DOM.
─────────────────────────────────────────────────────────────── */
(function () {
  const CAL = 'https://calendly.com/ammar-ivorystudios/30min';
  const bookCall = `onclick="if(window.Calendly){Calendly.initPopupWidget({url:'${CAL}'});}return false;"`;
  const page = document.body.dataset.page || '';

  const links = [
    { id: 'services', label: 'Services', href: 'services.html' },
    { id: 'work',     label: 'Work',     href: 'work.html' },
    { id: 'about',    label: 'About',    href: 'about.html' },
    { id: 'contact',  label: 'Contact',  href: 'contact.html' },
  ];
  const navLinks = links.map(l =>
    `<li><a href="${l.href}"${l.id === page ? ' class="active"' : ''}>${l.label}</a></li>`).join('');
  const mobLinks = links.map(l => `<a href="${l.href}" class="mm-link">${l.label}</a>`).join('');

  const navEl = document.getElementById('site-nav');
  if (navEl) {
    navEl.innerHTML = `
      <nav class="nav" id="nav">
        <a href="index.html" class="nav-logo">IVORY<span class="logo-accent">STUDIOS</span></a>
        <ul class="nav-links">${navLinks}</ul>
        <div class="nav-actions">
          <a href="login.html" class="nav-login">Client Login</a>
          <a href="contact.html" class="btn-nav magnetic" ${bookCall}>Book a Call</a>
        </div>
        <button class="nav-ham" id="nav-ham" aria-label="Menu"><span></span><span></span></button>
      </nav>
      <div class="mobile-menu" id="mobile-menu">
        ${mobLinks}
        <a href="login.html" class="mm-link">Client Login</a>
        <a href="contact.html" class="btn-primary full-w mt" ${bookCall}>Book a Call →</a>
      </div>`;

    // Skip link (keyboard a11y) + a focus landmark right after the nav.
    const skip = document.createElement('a');
    skip.href = '#main'; skip.className = 'skip-link'; skip.textContent = 'Skip to content';
    document.body.insertBefore(skip, document.body.firstChild);
    if (!document.getElementById('main')) {
      const anchor = document.createElement('span');
      anchor.id = 'main'; anchor.tabIndex = -1;
      navEl.insertAdjacentElement('afterend', anchor);
    }
  }

  const footEl = document.getElementById('site-footer');
  if (footEl) {
    footEl.innerHTML = `
      <footer class="footer">
        <div class="container footer-inner">
          <div class="footer-top">
            <div class="footer-brand">
              <div class="footer-logo">IVORY<span>STUDIOS</span></div>
              <p class="footer-tagline">We build websites that convert.<br>Cairo, Egypt · Worldwide.</p>
            </div>
            <div class="footer-links-group">
              <div class="flg-title">Services</div>
              <a href="services.html#web-design">Web Design</a>
              <a href="services.html#web-development">Web Development</a>
              <a href="services.html#brand-identity">Brand Identity</a>
              <a href="services.html#seo-growth">SEO &amp; Growth</a>
            </div>
            <div class="footer-links-group">
              <div class="flg-title">Company</div>
              <a href="work.html">Our Work</a>
              <a href="about.html">About &amp; Process</a>
              <a href="contact.html">Contact</a>
              <a href="login.html">Client Portal</a>
            </div>
            <div class="footer-links-group">
              <div class="flg-title">Connect</div>
              <a href="mailto:teams@ivorystudios.io">teams@ivorystudios.io</a>
              <div class="footer-socials">
                <a href="https://instagram.com/ivorystudios" target="_blank" rel="noopener" aria-label="Instagram" class="fs-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                </a>
                <a href="https://www.linkedin.com/company/gowithivory/" target="_blank" rel="noopener" aria-label="LinkedIn" class="fs-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="https://x.com/gowithivory" target="_blank" rel="noopener" aria-label="X" class="fs-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 1.2h3.7l-8 9.2 9.4 12.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9 6.1-6.9zm-1.3 19.5h2L6.5 3.3h-2.2L17.6 20.7z"/></svg>
                </a>
                <a href="https://www.facebook.com/gowithivory" target="_blank" rel="noopener" aria-label="Facebook" class="fs-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <span>&copy; 2026 Ivory Studios. All rights reserved.</span>
            <a href="contact.html" class="footer-cta" ${bookCall}>Book a Call →</a>
          </div>
        </div>
      </footer>`;
  }
})();
