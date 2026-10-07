#!/usr/bin/env node
// Static build, no dependencies. Run after editing pages: npm run build:html
//
// - rewrites internal links to clean URLs (/about, /assets/...)
// - bakes the shared nav, footer and service-page sections into the HTML
// - renders case studies from content/projects.mjs to /case-studies/<slug>.html
// - regenerates sitemap.xml
// Files are only written when their content actually changes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

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

// Shared nav + footer
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
    <a href="/" class="nav-logo" aria-label="Ivory Studios home">IVORY<span class="logo-accent">STUDIOS</span></a>
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

// Link cleanup + nav/footer injection
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

// "How we work" + proof section, shared by the four service pages
const SERVICE_PAGES = ['web-design', 'web-development', 'brand-identity', 'seo-growth'];
const ICON = {
  arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  search: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
  design: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
  build: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  launch: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
};
const step = (n, title, desc, tag, icon) =>
  `<div class="process-step reveal-up"><div class="ps-num">${n}</div><div class="ps-icon">${icon}</div><h3 class="ps-title">${title}</h3><p class="ps-desc">${desc}</p><div class="ps-tag">${tag}</div></div>`;
const connector = `<div class="process-connector reveal-fade"><div class="pc-line"></div>${ICON.arrow}</div>`;

const PROCESS_HTML = `<!--process:start-->
<section class="section">
  <div class="container">
    <div class="section-header reveal-up"><div class="section-label">How We Work</div><h2 class="section-title">A clear, <span class="accent">proven</span> process</h2></div>
    <div class="process-steps">
      ${[
        step('01', 'Discovery', 'We learn your goals, audience and competitors before anything gets designed.', 'Week 1', ICON.search),
        step('02', 'Design', 'You review and sign off high-fidelity designs, so launch day has no surprises.', 'Weeks 2–3', ICON.design),
        step('03', 'Build', 'Clean, fast, SEO-ready code. Mobile-first, with green Core Web Vitals.', 'Weeks 3–5', ICON.build),
        step('04', 'Launch &amp; Grow', 'We launch, watch the numbers and keep improving with ongoing support.', 'Week 6+', ICON.launch),
      ].join(`\n      ${connector}\n      `)}
    </div>
  </div>
</section>
<section class="section dark-section">
  <div class="container svc-proof reveal-up">
    <div class="svc-proof-stars" role="img" aria-label="5 out of 5 stars">★★★★★</div>
    <p class="svc-proof-quote">"None of the agencies we tried before opened a discovery call with a conversion goal instead of a colour palette. Ivory did, and three months later our qualified leads are up 3×."</p>
    <div class="svc-proof-author">Ahmed Kamal · CEO, NovaTech Solutions</div>
    <div class="svc-proof-stats"><span><strong>50+</strong> projects</span><span><strong>30+</strong> clients</span><span><strong>98%</strong> satisfaction</span></div>
    <a href="/work" class="btn-ghost">See the results in our work ${ICON.arrow}</a>
  </div>
</section>
<!--process:end-->
`;

function serviceProcess(file, html) {
  if (!SERVICE_PAGES.includes(file.replace(/\.html$/, ''))) return html;
  if (html.includes('<!--process:start-->')) {
    return html.replace(/<!--process:start-->[\s\S]*?<!--process:end-->\n/, () => PROCESS_HTML);
  }
  return html.replace(/(  <section class="section">\n    <div class="container faq-wrap">)/, () => PROCESS_HTML + '\n' + '  <section class="section">\n    <div class="container faq-wrap">');
}

// Case studies
const projects = (await import(pathToFileURL(path.join(ROOT, 'content/projects.mjs')))).default;

function trim(text, max = 155) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

function caseStudy(slug, p) {
  const url = `${ORIGIN}/case-studies/${slug}`;
  const title = `${p.title} Case Study | Ivory Studios`;
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
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(p.tagline)}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(p.tagline)}">
  <meta name="twitter:image" content="${OG_IMAGE}">
  <meta name="theme-color" content="#080706">
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preconnect" href="https://images.pexels.com">
  <link rel="preload" href="/assets/fonts/syne-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body data-page="work">

<div class="cursor-dot" id="cursor-dot"></div>
<div class="cursor-ring" id="cursor-ring"></div>

<div id="site-nav"></div>

<main class="project-page">
  <header class="proj-hero">
    <div class="proj-hero-img">
      <img src="${esc(p.cover)}" alt="${esc(p.title)}: ${esc(p.services.join(', '))} by Ivory Studios" fetchpriority="high" width="1600" height="900">
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
      ${p.gallery.map(src => `<div class="proj-shot"><img src="${esc(src)}" alt="${esc(p.title)} project image" loading="lazy" width="1200" height="800"></div>`).join('\n      ')}
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

<script src="/assets/js/partials.js" defer></script>
<script src="/assets/js/track.js" defer></script>
<script src="/assets/js/main.js" defer></script>
<script defer src="/_vercel/insights/script.js"></script>
<script defer src="/_vercel/speed-insights/script.js"></script>
</body>
</html>
`;
}

// Run
console.log('Ivory Studios build');

const rootPages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !f.startsWith('.'));
for (const file of rootPages) {
  write(file, ensureTracking(serviceProcess(file, chrome(normalise(read(file))))));
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

// Sitemap
// lastmod = last commit that touched the file (file mtimes reset on every clone).
// Uncommitted edits fall back to today.
function lastmod(f) {
  try {
    const dirty = execFileSync('git', ['status', '--porcelain', '--', f], { cwd: ROOT, encoding: 'utf8' }).trim();
    if (!dirty) {
      const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', f], { cwd: ROOT, encoding: 'utf8' }).trim();
      if (d) return d;
    }
  } catch { /* not a git checkout */ }
  return new Date().toISOString().slice(0, 10);
}
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
${urls.map(([loc, f]) =>
  `  <url><loc>${ORIGIN}${loc}</loc><lastmod>${lastmod(f)}</lastmod></url>`).join('\n')}
</urlset>
`);

// Every public page must have the nav + footer baked in
const publicPages = [...MARKETING.map(p => `${p}.html`), 'index.html', ...Object.keys(projects).map(s => `case-studies/${s}.html`)];
const missing = publicPages.filter(f => fs.existsSync(path.join(ROOT, f)) &&
  !(read(f).includes('<!--nav:start-->') && read(f).includes('<!--footer:start-->')));
if (missing.length) { console.error('ERROR: nav/footer missing in:', missing.join(', ')); process.exit(1); }

console.log('Done.');
