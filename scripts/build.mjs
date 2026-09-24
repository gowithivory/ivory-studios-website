#!/usr/bin/env node
/* Ivory Studios — static build. Zero dependencies.
   Run after editing any page:  npm run build:html

   - Normalises internal links to clean absolute URLs (/about, /assets/...)
   - Bakes the shared nav + footer into every page (crawlable without JS)
   - Pre-renders every case study to /case-studies/<slug>.html
   - Regenerates sitemap.xml (lastmod = the page file's mtime)
   Idempotent: files are only rewritten when their content changes. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://ivorystudios.io';
const OG_IMAGE = `${ORIGIN}/assets/img/og-image.png`;

const MARKETING = ['services', 'work', 'about', 'contact', 'web-design', 'web-development', 'brand-identity', 'seo-growth', 'privacy', 'terms'];
const PORTAL = ['login', 'signup', 'dashboard', 'reset-password'];
const CLEAN_PAGES = [...MARKETING, ...PORTAL];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
function write(file, content) {
  const p = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  if (fs.existsSync(p) && fs.readFileSync(p, 'utf8') === content) return false;
  fs.writeFileSync(p, content);
  console.log('  wrote', file);
  return true;
}

/* ─── Shared chrome ─────────────────────────────────────────── */
const NAV_LINKS = [
  ['services', 'Services', '/services'],
  ['work', 'Work', '/work'],
  ['about', 'About', '/about'],
  ['contact', 'Contact', '/contact'],
];

const navHtml = page => `<!--nav:start-->
<a href="#main" class="skip-link">Skip to content</a>
<div id="site-nav">
  <nav class="nav" id="nav" aria-label="Primary">
    <a href="/" class="nav-logo" aria-label="Ivory Studios — home">IVORY<span class="logo-accent">STUDIOS</span></a>
    <ul class="nav-links">${NAV_LINKS.map(([id, label, href]) =>
      `<li><a href="${href}"${id === page ? ' class="active" aria-current="page"' : ''}>${label}</a></li>`).join('')}</ul>
    <div class="nav-actions">
      <a href="/login" class="nav-login" data-account>Client Login</a>
      <a href="/contact" class="btn-nav magnetic" data-calendly>Book a Call</a>
    </div>
    <button class="nav-ham" id="nav-ham" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span></button>
  </nav>
  <div class="mobile-menu" id="mobile-menu">
    ${NAV_LINKS.map(([, label, href]) => `<a href="${href}" class="mm-link">${label}</a>`).join('\n    ')}
    <a href="/login" class="mm-link" data-account>Client Login</a>
    <a href="/contact" class="btn-primary full-w mt" data-calendly>Book a Call →</a>
  </div>
</div>
<span id="main" tabindex="-1"></span>
<!--nav:end-->`;

const FOOTER_HTML = `<!--footer:start-->
<div id="site-footer">
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-logo">IVORY<span>STUDIOS</span></div>
          <p class="footer-tagline">We build websites that convert.<br>Cairo, Egypt · Worldwide.</p>
        </div>
        <nav class="footer-links-group" aria-label="Services">
          <div class="flg-title">Services</div>
          <a href="/web-design">Web Design</a>
          <a href="/web-development">Web Development</a>
          <a href="/brand-identity">Brand Identity</a>
          <a href="/seo-growth">SEO &amp; Growth</a>
        </nav>
        <nav class="footer-links-group" aria-label="Company">
          <div class="flg-title">Company</div>
          <a href="/work">Our Work</a>
          <a href="/about">About &amp; Process</a>
          <a href="/contact">Contact</a>
          <a href="/login">Client Portal</a>
        </nav>
        <div class="footer-links-group">
          <div class="flg-title">Connect</div>
          <a href="mailto:teams@ivorystudios.io">teams@ivorystudios.io</a>
          <div class="footer-socials">
            <a href="https://instagram.com/ivorystudios" target="_blank" rel="noopener" aria-label="Instagram" class="fs-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>
            <a href="https://www.linkedin.com/company/gowithivory/" target="_blank" rel="noopener" aria-label="LinkedIn" class="fs-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
            <a href="https://x.com/gowithivory" target="_blank" rel="noopener" aria-label="X" class="fs-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.2h3.7l-8 9.2 9.4 12.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9 6.1-6.9zm-1.3 19.5h2L6.5 3.3h-2.2L17.6 20.7z"/></svg></a>
            <a href="https://www.facebook.com/gowithivory" target="_blank" rel="noopener" aria-label="Facebook" class="fs-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} Ivory Studios. All rights reserved.</span>
        <span class="footer-legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><button type="button" class="footer-consent" data-consent-open>Cookie settings</button></span>
        <a href="/contact" class="footer-cta" data-calendly>Book a Call →</a>
      </div>
    </div>
  </footer>
</div>
<!--footer:end-->`;

/* ─── Link normalisation + chrome injection ─────────────────── */
function normalise(html) {
  return html
    .replace(/(href|action)="index\.html"/g, '$1="/"')
    .replace(new RegExp(`href="(${CLEAN_PAGES.join('|')})\\.html(#[^"]*)?"`, 'g'), (_, p, h) => `href="/${p}${h || ''}"`)
    .replace(/href="project\.html\?slug=([a-z0-9-]+)"/g, 'href="/case-studies/$1"')
    .replace(/(href|src)="assets\//g, '$1="/assets/')
    .replace(/href="site\.webmanifest"/g, 'href="/site.webmanifest"')
    .replace(/\sonclick="if\(window\.Calendly\)\{[^"]*\}"/g, ' data-calendly')
    .replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2"><\/script>/g,
      '<script src="/assets/js/vendor/supabase.min.js"></script>');
}

const NAV_SLOT = /<!--nav:start-->[\s\S]*?<!--nav:end-->|<div id="site-nav"><\/div>(?:\s*<noscript>[\s\S]*?<\/noscript>)?/;
const FOOT_SLOT = /<!--footer:start-->[\s\S]*?<!--footer:end-->|<div id="site-footer"><\/div>/;

function chrome(html) {
  if (!NAV_SLOT.test(html) && !FOOT_SLOT.test(html)) return html;
  const page = (html.match(/<body[^>]*data-page="([^"]*)"/) || [])[1] || '';
  return html.replace(NAV_SLOT, () => navHtml(page)).replace(FOOT_SLOT, () => FOOTER_HTML);
}

function ensureTracking(html) {
  if (!html.includes('/assets/js/partials.js')) return html;
  html = html.replace('<script src="/assets/js/partials.js"></script>', '<script src="/assets/js/partials.js" defer></script>');
  html = html.replace('<script src="/assets/js/main.js"></script>', '<script src="/assets/js/main.js" defer></script>');
  if (!html.includes('/assets/js/track.js')) {
    html = html.replace('<script src="/assets/js/partials.js" defer></script>',
      '<script src="/assets/js/partials.js" defer></script>\n<script src="/assets/js/track.js" defer></script>');
  }
  return html;
}

/* ─── Case studies ──────────────────────────────────────────── */
const projects = (await import(pathToFileURL(path.join(ROOT, 'content/projects.mjs')))).default;

function trim(text, max = 155) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

function caseStudy(slug, p) {
  const url = `${ORIGIN}/case-studies/${slug}`;
  const title = `${p.title} — Case Study | Ivory Studios`;
  const desc = trim(`${p.tagline} ${p.intro}`);
  const keys = Object.keys(projects);
  const next = keys[(keys.indexOf(slug) + 1) % keys.length];
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Work', item: `${ORIGIN}/work` },
          { '@type': 'ListItem', position: 3, name: p.title, item: url },
        ],
      },
      {
        '@type': 'CreativeWork',
        '@id': `${url}#work`,
        name: p.title,
        headline: p.tagline,
        description: p.intro,
        image: p.cover,
        datePublished: p.year,
        url,
        keywords: p.services.join(', '),
        creator: { '@id': `${ORIGIN}/#org` },
      },
    ],
  };
  const live = p.liveUrl && p.liveUrl !== '#'
    ? `<a href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer">Visit site ↗</a>`
    : `<strong class="muted">${p.concept ? 'Concept build' : 'Under NDA'}</strong>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Ivory Studios">
  <meta property="og:title" content="${esc(p.title)} — Ivory Studios">
  <meta property="og:description" content="${esc(p.tagline)}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(p.title)} — Ivory Studios">
  <meta name="twitter:description" content="${esc(p.tagline)}">
  <meta name="twitter:image" content="${OG_IMAGE}">
  <meta name="theme-color" content="#080706">
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://images.pexels.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body data-page="work">

<div class="cursor-dot" id="cursor-dot"></div>
<div class="cursor-ring" id="cursor-ring"></div>

<div id="site-nav"></div>

<main class="project-page">
  <header class="proj-hero">
    <div class="proj-hero-img">
      <img src="${esc(p.cover)}" alt="${esc(p.title)} — ${esc(p.services.join(', '))} by Ivory Studios" fetchpriority="high" width="1600" height="900">
      <div class="proj-hero-shade"></div>
    </div>
    <div class="container proj-hero-inner">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span>/</span> <a href="/work">Work</a> <span>/</span> <span class="crumbs-current">${esc(p.title)}</span></nav>
      <div class="proj-services">${p.services.map(s => `<span>${esc(s)}</span>`).join('')}</div>
      <h1 class="proj-title">${esc(p.title)}</h1>
      <p class="proj-tagline">${esc(p.tagline)}</p>
    </div>
  </header>

  <section class="container proj-meta-bar" aria-label="Project details">
    <div class="pm-item"><span>Client</span><strong>${esc(p.client)}</strong></div>
    <div class="pm-item"><span>Year</span><strong>${esc(p.year)}</strong></div>
    <div class="pm-item"><span>Scope</span><strong>${esc(p.services.join(', '))}</strong></div>
    <div class="pm-item"><span>Live</span>${live}</div>
  </section>

  <article class="container proj-body">
    ${p.concept ? '<p class="proj-concept"><strong>Concept project.</strong> An illustrative build by Ivory Studios, not a client engagement. Figures are targets, not results.</p>' : ''}
    <p class="proj-intro">${esc(p.intro)}</p>

    <div class="proj-metrics">
      ${p.metrics.map(m => `<div class="proj-metric"><div class="pmet-val">${esc(m.value)}</div><div class="pmet-label">${esc(m.label)}</div></div>`).join('\n      ')}
    </div>

    <div class="proj-cols">
      <div class="proj-col"><h2 class="proj-h2">The Challenge</h2><p>${esc(p.challenge)}</p></div>
      <div class="proj-col"><h2 class="proj-h2">Our Solution</h2><p>${esc(p.solution)}</p></div>
    </div>

    <div class="proj-gallery">
      ${p.gallery.map(src => `<div class="proj-shot"><img src="${esc(src)}" alt="${esc(p.title)} — interface detail" loading="lazy" width="1200" height="800"></div>`).join('\n      ')}
    </div>

    <div class="proj-stack"><span class="proj-stack-label">Built with</span>${p.stack.map(t => `<span class="stack-pill">${esc(t)}</span>`).join('')}</div>
  </article>

  <section class="proj-next dark-section">
    <div class="container proj-next-inner">
      <div>
        <span class="section-label">Next Project</span>
        <a href="/case-studies/${next}" class="proj-next-title">${esc(projects[next].title)} →</a>
      </div>
      <a href="/contact" class="btn-primary magnetic" data-calendly>Start your project</a>
    </div>
  </section>
</main>

<div id="site-footer"></div>

<script src="https://assets.calendly.com/assets/external/widget.js" async></script>
<script src="/assets/js/partials.js" defer></script>
<script src="/assets/js/track.js" defer></script>
<script src="/assets/js/main.js" defer></script>
<script defer src="/_vercel/insights/script.js"></script>
<script defer src="/_vercel/speed-insights/script.js"></script>
</body>
</html>
`;
}

/* ─── Run ───────────────────────────────────────────────────── */
console.log('Ivory Studios build');

const rootPages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !f.startsWith('.'));
for (const file of rootPages) {
  write(file, ensureTracking(chrome(normalise(read(file)))));
}

const expected = new Set();
for (const [slug, p] of Object.entries(projects)) {
  const file = `case-studies/${slug}.html`;
  expected.add(`${slug}.html`);
  write(file, chrome(caseStudy(slug, p)));
}
for (const f of fs.readdirSync(path.join(ROOT, 'case-studies'))) {
  if (f.endsWith('.html') && !f.startsWith('.') && !expected.has(f)) console.warn(`  warning: case-studies/${f} has no entry in content/projects.mjs`);
}

/* sitemap */
const mtime = f => fs.statSync(path.join(ROOT, f)).mtime.toISOString().slice(0, 10);
const urls = [
  ['/', 'index.html', 'weekly', '1.0'],
  ['/services', 'services.html', 'monthly', '0.9'],
  ['/web-design', 'web-design.html', 'monthly', '0.9'],
  ['/web-development', 'web-development.html', 'monthly', '0.9'],
  ['/brand-identity', 'brand-identity.html', 'monthly', '0.8'],
  ['/seo-growth', 'seo-growth.html', 'monthly', '0.8'],
  ['/work', 'work.html', 'weekly', '0.9'],
  ['/about', 'about.html', 'monthly', '0.7'],
  ['/contact', 'contact.html', 'monthly', '0.8'],
  ...Object.keys(projects).map(s => [`/case-studies/${s}`, `case-studies/${s}.html`, 'monthly', '0.6']),
  ['/privacy', 'privacy.html', 'yearly', '0.2'],
  ['/terms', 'terms.html', 'yearly', '0.2'],
].filter(([, f]) => fs.existsSync(path.join(ROOT, f)));

write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([loc, f, freq, pri]) =>
  `  <url><loc>${ORIGIN}${loc}</loc><lastmod>${mtime(f)}</lastmod><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`).join('\n')}
</urlset>
`);

/* sanity: every public page must carry the baked-in nav + footer */
const publicPages = [...MARKETING.map(p => `${p}.html`), 'index.html', ...Object.keys(projects).map(s => `case-studies/${s}.html`)];
const missing = publicPages.filter(f => fs.existsSync(path.join(ROOT, f)) &&
  !(read(f).includes('<!--nav:start-->') && read(f).includes('<!--footer:start-->')));
if (missing.length) { console.error('ERROR: nav/footer missing in:', missing.join(', ')); process.exit(1); }

console.log('Done.');
