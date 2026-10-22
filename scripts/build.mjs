#!/usr/bin/env node
// Static build, no dependencies. Run after editing pages: npm run build:html
//
// - rewrites internal links to clean URLs (/about, /assets/...)
// - bakes the shared nav and footer into every page
// - renders service pages from content/services.mjs to /<slug>.html
// - renders case studies from content/projects.mjs to /case-studies/<slug>.html
// - fills the generated blocks (<!--name:start--> … <!--name:end-->) on the
//   home, services and work pages
// - regenerates sitemap.xml
// Files are only written when their content actually changes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://ivorystudios.io';
const OG_IMAGE = `${ORIGIN}/assets/img/og-image.png`;

const load = async f => (await import(pathToFileURL(path.join(ROOT, f)))).default;
const projects = await load('content/projects.mjs');
const services = await load('content/services.mjs');

const SERVICE_PAGES = Object.keys(services);
const MARKETING = ['services', 'work', 'about', 'contact', ...SERVICE_PAGES, 'website-project-checklist', 'privacy', 'terms'];
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

// Icons
const ICON = {
  arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  diag: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
};
const LOGO = '<svg class="logo-mark" viewBox="26 26 64 68" aria-hidden="true" focusable="false"><rect x="30" y="30" width="42" height="8" rx="4" fill="currentColor"/><rect x="47" y="38" width="8" height="44" rx="2" fill="currentColor"/><rect x="30" y="82" width="42" height="8" rx="4" fill="currentColor"/><rect class="logo-caret" x="78" y="32" width="8" height="56" rx="4" fill="#C19A5B"/></svg>';

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
  <header class="nav" id="nav">
    <a href="/" class="nav-logo" aria-label="Ivory Studios home">${LOGO}<span>IVORY<span class="logo-accent">STUDIOS</span></span></a>
    <nav aria-label="Primary"><ul class="nav-links">${NAV_LINKS.map(([id, label, href]) =>
      `<li><a href="${href}"${id === page ? ' class="active" aria-current="page"' : ''}>${label}</a></li>`).join('')}</ul></nav>
    <div class="nav-actions">
      <a href="/login" class="nav-login" data-account>Client Login</a>
      <a href="/contact" class="btn-nav" data-calendly>Book a Call</a>
    </div>
    <button class="nav-ham" id="nav-ham" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span></button>
  </header>
  <div class="mobile-menu" id="mobile-menu" hidden>
    <nav class="mm-links" aria-label="Mobile">
      ${NAV_LINKS.map(([id, label, href], i) => `<a href="${href}" class="mm-link" style="--i:${i}"${id === page ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ')}
    </nav>
    <div class="mm-foot">
      <a href="/contact" class="btn-primary full-w" data-calendly>Book a Discovery Call ${ICON.arrow}</a>
      <div class="mm-meta"><a href="/login" data-account>Client Login</a><a href="mailto:teams@ivorystudios.io">teams@ivorystudios.io</a></div>
    </div>
  </div>
</div>
<span id="main" tabindex="-1"></span>
<!--nav:end-->`;

const SOCIAL = [
  ['Instagram', 'https://instagram.com/ivorystudios', '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>'],
  ['LinkedIn', 'https://www.linkedin.com/company/gowithivory/', '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>'],
  ['X', 'https://x.com/gowithivory', '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.2h3.7l-8 9.2 9.4 12.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9 6.1-6.9zm-1.3 19.5h2L6.5 3.3h-2.2L17.6 20.7z"/></svg>'],
  ['Facebook', 'https://www.facebook.com/gowithivory', '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>'],
];
const socialLinks = cls => SOCIAL.map(([label, href, svg]) =>
  `<a href="${href}" target="_blank" rel="noopener" aria-label="Ivory Studios on ${label}" class="${cls}">${svg}</a>`).join('\n            ');

const FOOTER_HTML = `<!--footer:start-->
<div id="site-footer">
  <footer class="footer">
    <div class="container footer-inner">
      <p class="footer-sign" aria-hidden="true"><span>We build.</span> <span>You grow.</span></p>
      <div class="footer-top">
        <div class="footer-brand">
          <a href="/" class="footer-logo" aria-label="Ivory Studios home">${LOGO}<span>IVORY<span>STUDIOS</span></span></a>
          <p class="footer-tagline">Your vision, brought to life. Websites, brands and business systems from Cairo, for clients worldwide.</p>
        </div>
        <nav class="footer-links-group" aria-label="Services">
          <h2 class="flg-title">Services</h2>
          ${Object.entries(services).map(([slug, s]) => `<a href="/${slug}">${esc(s.nav || s.name)}</a>`).join('\n          ')}
        </nav>
        <nav class="footer-links-group" aria-label="Company">
          <h2 class="flg-title">Studio</h2>
          <a href="/work">Work</a>
          <a href="/about">About &amp; Process</a>
          <a href="/website-project-checklist">Project checklist</a>
          <a href="/contact">Contact</a>
          <a href="/login">Client Portal</a>
        </nav>
        <div class="footer-links-group">
          <h2 class="flg-title">Contact</h2>
          <a href="mailto:teams@ivorystudios.io">teams@ivorystudios.io</a>
          <span class="footer-note">Cairo, Egypt · Working worldwide</span>
          <div class="footer-socials">
            ${socialLinks('fs-icon')}
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} Ivory Studios. All rights reserved.</span>
        <span class="footer-legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><button type="button" class="footer-consent" data-consent-open>Cookie settings</button></span>
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
    .replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2"><\/script>/g,
      '<script src="/assets/js/vendor/supabase.min.js"></script>');
}

const NAV_SLOT = /<!--nav:start-->[\s\S]*?<!--nav:end-->|<div id="site-nav"><\/div>/;
const FOOT_SLOT = /<!--footer:start-->[\s\S]*?<!--footer:end-->|<div id="site-footer"><\/div>/;

function chrome(html) {
  if (!NAV_SLOT.test(html) && !FOOT_SLOT.test(html)) return html;
  const page = (html.match(/<body[^>]*data-page="([^"]*)"/) || [])[1] || '';
  return html.replace(NAV_SLOT, () => navHtml(page)).replace(FOOT_SLOT, () => FOOTER_HTML);
}

// Replace <!--name:start--> … <!--name:end--> with generated markup
function block(html, name, content) {
  const re = new RegExp(`(<!--${name}:start-->)[\\s\\S]*?(<!--${name}:end-->)`);
  return re.test(html) ? html.replace(re, (_, a, b) => `${a}\n${content}\n${b}`) : html;
}

// Images: optimised WebP in assets/img/work, sized from the file header
function webpSize(file) {
  const b = fs.readFileSync(path.join(ROOT, file));
  const fourcc = b.toString('ascii', 12, 16);
  if (fourcc === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (fourcc === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (fourcc === 'VP8L') { const v = b.readUInt32LE(21); return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1]; }
  throw new Error(`unknown WebP format: ${file}`);
}
function img(slug, name, { alt, sizes, eager = false, cls = '' }) {
  const widths = name === 'cover' ? [800, 1600] : [800, 1200];
  const src = w => `/assets/img/work/${slug}-${name}-${w}.webp`;
  const missing = widths.find(w => !fs.existsSync(path.join(ROOT, src(w))));
  if (missing) throw new Error(`missing image ${src(missing)}`);
  const [w, h] = webpSize(src(widths[0]));
  return `<img src="${src(widths[0])}" srcset="${widths.map(x => `${src(x)} ${x}w`).join(', ')}" sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}"${cls ? ` class="${cls}"` : ''}${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
}

// Project services that have a page of their own, for links from case studies.
const SERVICE_LINK = {
  'Web Design': 'web-design', 'UI/UX Design': 'web-design',
  'Development': 'web-development', 'Web App': 'web-development', 'E-commerce': 'web-development',
  'Branding': 'brand-identity',
  'SEO': 'seo-growth', 'Local SEO': 'seo-growth', 'Content Strategy': 'seo-growth',
  'Membership Portal': 'business-systems', 'Booking Platform': 'business-systems', 'Booking Engine': 'business-systems', 'Learning Platform': 'business-systems',
};

// Project cards (work page + home page)
function workCard(slug, p, { large = false, heading = 'h3', sizes = '' } = {}) {
  const label = p.concept ? 'Concept study' : 'Client project';
  const svc = [...new Set(p.services.map(x => SERVICE_LINK[x]).filter(Boolean))].join(' ');
  return `<a href="/case-studies/${slug}" class="work-card${large ? ' work-card--large' : ''}${p.concept ? ' is-concept' : ''} reveal-up" data-services="${svc}">
  <div class="wc-img">${img(slug, 'cover', { alt: p.photoAlt, sizes: sizes || (large ? '(max-width: 900px) 100vw, 800px' : '(max-width: 900px) 100vw, 600px') })}</div>
  <div class="wc-body">
    <div class="wc-meta"><span class="wc-badge${p.concept ? '' : ' wc-badge--client'}">${label}</span><span>${esc(p.kind)}</span></div>
    <${heading} class="wc-title">${esc(p.title)}</${heading}>
    <p class="wc-sub">${esc(p.summary)}</p>
    ${large && !p.concept && p.metrics?.length ? `<dl class="wc-metrics">${p.metrics.map(m => `<div><dt>${esc(m.value)}</dt><dd>${esc(m.label)}</dd></div>`).join('')}</dl>` : ''}
    <span class="wc-cta">${p.concept ? 'Read the study' : 'View case study'} ${ICON.diag}</span>
  </div>
</a>`;
}

const clientSlugs = Object.keys(projects).filter(s => !projects[s].concept);
const conceptSlugs = Object.keys(projects).filter(s => projects[s].concept);

const WORK_CLIENT = `<div class="work-grid work-grid--single">
${clientSlugs.map(s => workCard(s, projects[s], { large: true, heading: 'h3' })).join('\n')}
</div>`;
// The Work page as a collection of every case study, client work first.
const WORK_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Work', item: `${ORIGIN}/work` },
    ] },
    { '@type': 'CollectionPage', '@id': `${ORIGIN}/work#page`, name: 'Ivory Studios work', url: `${ORIGIN}/work`,
      isPartOf: { '@id': `${ORIGIN}/#website` }, about: { '@id': `${ORIGIN}/#org` },
      mainEntity: { '@type': 'ItemList', itemListElement: [...clientSlugs, ...conceptSlugs].map((k, i) => ({
        '@type': 'ListItem', position: i + 1, url: `${ORIGIN}/case-studies/${k}`, name: projects[k].title })) } },
  ],
};
const WORK_CONCEPTS = `<div class="work-grid">
${conceptSlugs.map(s => workCard(s, projects[s])).join('\n')}
</div>`;
const HOME_FEATURED = `<div class="work-grid">
${workCard('apadel', projects.apadel, { large: true })}
${['velluto', 'pulseboard'].map(s => workCard(s, projects[s])).join('\n')}
</div>`;

// Service lists (home + services overview)
const serviceCards = (heading = 'h3') => Object.entries(services).map(([slug, s]) =>
  `<a href="/${slug}" class="service-card reveal-up">
  <span class="sc-num">${s.num}</span>
  <${heading} class="sc-title">${esc(s.name)}</${heading}>
  <p class="sc-desc">${esc(s.short)}</p>
  <span class="sc-link">Explore ${esc(s.nav || s.name)} ${ICON.arrow}</span>
</a>`).join('\n');

const SERVICES_DETAIL = Object.entries(services).map(([slug, s]) => `<article id="${slug}" class="svc-row reveal-up">
  <div class="svc-info">
    <div class="svc-num">${s.num}</div>
    <h2 class="svc-title"><a href="/${slug}">${esc(s.name)}</a></h2>
    <p class="svc-lead">${esc(s.lead)}</p>
    <a href="/${slug}" class="text-link">How we approach ${esc(s.nav || s.name)} ${ICON.arrow}</a>
  </div>
  <div class="svc-panel">
    <div class="svc-panel-block"><h3 class="svc-panel-title">Who it's for</h3><ul class="tick-list">${s.forWho.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="svc-panel-block"><h3 class="svc-panel-title">What you receive</h3><ul class="dot-list">${s.deliverables.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
  </div>
</article>`).join('\n');

// Process (home, services, about and each service page)
const STEPS = [
  ['01', 'Discovery', 'We learn how your business works, who you serve and what success looks like. You get a written plan with scope, timeline and a fixed price.', 'Week 1'],
  ['02', 'Design', 'Wireframes first, then high-fidelity designs you review and approve. Nothing is built until you are happy with it.', 'Weeks 2–3'],
  ['03', 'Build', 'We develop, test on real devices and share progress in your client portal as we go.', 'Weeks 3–6'],
  ['04', 'Launch &amp; grow', 'We launch, monitor and fix anything that surfaces, then stay on hand for improvements.', 'Ongoing'],
];
const PROCESS_STEPS = `<ol class="process-steps">
${STEPS.map(([n, t, d, tag]) => `  <li class="process-step reveal-up"><span class="ps-num">${n}</span><h3 class="ps-title">${t}</h3><p class="ps-desc">${d}</p><span class="ps-tag">${tag}</span></li>`).join('\n')}
</ol>
<p class="process-note">Typical timeline for a marketing website. Brand and systems projects are scoped individually.</p>`;

// Shared <head>
// Page-specific share card from assets/img/og, if one has been rendered.
const ogCard = name => fs.existsSync(path.join(ROOT, `assets/img/og/${name}.jpg`)) ? `${ORIGIN}/assets/img/og/${name}.jpg` : OG_IMAGE;

function head({ title, description, url, type = 'website', extra = '', preloadImg = '', ogImage = OG_IMAGE, ogAlt = 'Ivory Studios: Your Vision, Brought to Life.' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Ivory Studios">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(ogAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${ogImage}">
  <meta name="theme-color" content="#080706">
${extra}  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preload" href="/assets/fonts/syne-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
${preloadImg}  <link rel="stylesheet" href="/assets/css/style.css">
</head>`;
}

const SCRIPTS = `<script src="/assets/js/partials.js" defer></script>
<script src="/assets/js/track.js" defer></script>
<script src="/assets/js/main.js" defer></script>
<script defer src="/_vercel/insights/script.js"></script>
<script defer src="/_vercel/speed-insights/script.js"></script>`;

const ctaBand = (title, sub, reassure) => `<section class="section cta-band">
  <div class="container cta-band-inner reveal-up">
    <h2 class="cta-band-title">${title}</h2>
    <p class="cta-band-sub">${sub}</p>
    <div class="cta-band-actions">
      <a href="/contact" class="btn-primary btn-xl" data-calendly>Book a Discovery Call ${ICON.arrow}</a>
      <a href="/contact#brief" class="btn-ghost">Send a project brief</a>
    </div>
    <p class="cta-reassure">${reassure}</p>
  </div>
</section>`;
const CTA_REASSURE = 'Free 30-minute call · Fixed-price proposal within 48 hours · No obligation';

// Service pages
// Which project services count as examples of each service page. Matched
// against projects[*].services; client work is listed before concept studies.
const SERVICE_EXAMPLES = {
  'web-design': ['Web Design', 'UI/UX Design'],
  'web-development': ['Development', 'Web App'],
  'brand-identity': ['Branding'],
  'business-systems': ['Web App', 'Membership Portal', 'Booking Platform', 'Booking Engine', 'Learning Platform'],
  'seo-growth': ['SEO', 'Local SEO', 'Content Strategy'],
};
function serviceWork(slug) {
  const match = SERVICE_EXAMPLES[slug] || [];
  const picks = [...clientSlugs, ...conceptSlugs].filter(k => projects[k].services.some(x => match.includes(x))).slice(0, 3);
  if (!picks.length) return '';
  return `<section class="section">
    <div class="container">
      <div class="section-header reveal-up"><div class="section-label">See it in practice</div><h2 class="section-title">Related <span class="accent">work</span></h2></div>
      <div class="work-grid work-grid--three">
        ${picks.map(k => workCard(k, projects[k], { sizes: '(max-width: 860px) 100vw, 420px' })).join('\n        ')}
      </div>
      <div class="section-cta reveal-up"><a href="/work" class="btn-ghost">See all work ${ICON.arrow}</a></div>
    </div>
  </section>`;
}

function servicePage(slug, s) {
  const url = `${ORIGIN}/${slug}`;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${ORIGIN}/services` },
        { '@type': 'ListItem', position: 3, name: s.name, item: url },
      ] },
      { '@type': 'Service', '@id': `${url}#service`, name: s.name, description: s.description, url,
        provider: { '@id': `${ORIGIN}/#org` }, areaServed: 'Worldwide' },
      { '@type': 'FAQPage', mainEntity: s.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    ],
  };
  const others = s.related.map(r => [r, services[r]]);
  return `${head({ title: s.title, description: s.description, url, ogImage: ogCard(slug), ogAlt: `${s.name} by Ivory Studios`, extra: `  <script type="application/ld+json">${JSON.stringify(ld)}</script>\n` })}
<body data-page="services">

<div id="site-nav"></div>

<main class="service-page">
  <header class="page-hero">
    <div class="hero-grid-bg" aria-hidden="true"></div>
    <div class="container page-hero-inner">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">/</span> <a href="/services">Services</a> <span aria-hidden="true">/</span> <span class="crumbs-current" aria-current="page">${esc(s.name)}</span></nav>
      <div class="section-label">${s.num} · ${esc(s.name)}</div>
      <h1 class="page-hero-title">${s.h1}</h1>
      <p class="page-hero-sub">${esc(s.lead)}</p>
      <div class="hero-btns">
        <a href="/contact" class="btn-primary" data-calendly>Discuss your project ${ICON.arrow}</a>
        <a href="/work" class="btn-ghost">See our work</a>
      </div>
    </div>
  </header>

  <section class="section">
    <div class="container svc-detail-grid">
      <div class="svc-detail-main reveal-up">
        <h2 class="svc-h2">${esc(s.problemTitle)}</h2>
        <p class="svc-intro-lead">${esc(s.problem)}</p>
        <h3 class="svc-panel-title">Who it's for</h3>
        <ul class="tick-list">${s.forWho.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>
      <aside class="svc-detail-side reveal-up" aria-label="What's included">
        <div class="svc-deliverables">
          <h2 class="svc-deliverables-title">What you receive</h2>
          <ul class="dot-list">${s.deliverables.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
          <a href="/contact" class="btn-primary full-w" data-calendly>Book a Discovery Call</a>
        </div>
      </aside>
    </div>
  </section>

  <section class="section dark-section">
    <div class="container">
      <div class="section-header reveal-up"><div class="section-label">What changes</div><h2 class="section-title">What it does for <span class="accent">your business</span></h2></div>
      <div class="grid-3">
        ${s.outcomes.map(([t, d], i) => `<div class="benefit-card reveal-up"><div class="benefit-num">0${i + 1}</div><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('\n        ')}
      </div>
      ${s.proof ? `<p class="svc-proof reveal-up">${esc(s.proof)} <a href="/case-studies/apadel" class="text-link">Read the APadel case study ${ICON.arrow}</a></p>` : ''}
    </div>
  </section>

  ${serviceWork(slug)}

  <section class="section">
    <div class="container">
      <div class="section-header reveal-up"><div class="section-label">How we work</div><h2 class="section-title">A clear process, <span class="accent">start to finish</span></h2></div>
      ${PROCESS_STEPS}
    </div>
  </section>

  <section class="section dark-section">
    <div class="container faq-wrap">
      <div class="section-header reveal-up"><div class="section-label">Questions</div><h2 class="section-title">Common <span class="accent">questions</span></h2></div>
      <div class="faq-list reveal-up">
        ${s.faq.map(([q, a]) => `<details class="faq-item"><summary>${esc(q)}</summary><div class="faq-a">${esc(a)}</div></details>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-header reveal-up"><div class="section-label">Works well with</div><h2 class="section-title">Related <span class="accent">services</span></h2></div>
      <div class="grid-3">
        ${others.map(([r, o]) => `<a href="/${r}" class="related-service reveal-up"><span class="rs-name">${esc(o.name)}</span><span class="rs-sub">${esc(o.short)}</span><span class="rs-arrow" aria-hidden="true">${ICON.arrow}</span></a>`).join('\n        ')}
      </div>
    </div>
  </section>

  ${ctaBand('Let’s talk about <span class="accent">your project.</span>', 'Tell us where you are and where you want to be. We’ll come back with a clear plan and a fixed-price proposal.', CTA_REASSURE)}
</main>

<div id="site-footer"></div>

${SCRIPTS}
</body>
</html>
`;
}

// Case studies
function trim(text, max = 155) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

const listJoin = xs => xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;

function caseStudy(slug, p) {
  const url = `${ORIGIN}/case-studies/${slug}`;
  const title = `${p.title}${p.concept ? ' Concept Study' : ' Case Study'} | Ivory Studios`;
  // Whole sentences only: the tagline, then what the page is and the main services.
  const label = p.concept ? 'Concept study' : 'Case study';
  const desc = [3, 2, 1, 0].map(n => `${p.tagline} ${label} by Ivory Studios${n ? `: ${listJoin(p.services.slice(0, n))}` : ''}.`).find(d => d.length <= 160) || trim(p.tagline);
  const keys = [...clientSlugs, ...conceptSlugs];
  const next = keys[(keys.indexOf(slug) + 1) % keys.length];
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Work', item: `${ORIGIN}/work` },
        { '@type': 'ListItem', position: 3, name: p.title, item: url },
      ] },
      { '@type': 'CreativeWork', '@id': `${url}#work`, name: p.title, headline: p.tagline, description: p.intro,
        image: `${ORIGIN}/assets/img/work/${slug}-cover-1600.webp`, dateCreated: p.year, url,
        keywords: p.services.join(', '), creator: { '@id': `${ORIGIN}/#org` } },
    ],
  };
  const gallery = p.photos.gallery.map((_, i) => `<figure class="proj-shot">${img(slug, String(i + 1), { alt: `${p.title}: supporting image`, sizes: p.photos.gallery.length > 1 ? '(max-width: 768px) 100vw, 600px' : '(max-width: 1200px) 100vw, 1200px' })}</figure>`);
  return `${head({ title, description: desc, url, type: 'article', ogImage: ogCard(`case-${slug}`), ogAlt: `${p.title}: ${p.concept ? 'concept study' : 'case study'} by Ivory Studios`,
    extra: `  <script type="application/ld+json">${JSON.stringify(ld)}</script>\n`,
    preloadImg: `  <link rel="preload" as="image" href="/assets/img/work/${slug}-cover-1600.webp" imagesrcset="/assets/img/work/${slug}-cover-800.webp 800w, /assets/img/work/${slug}-cover-1600.webp 1600w" imagesizes="100vw" fetchpriority="high">\n` })}
<body data-page="work">

<div id="site-nav"></div>

<main class="project-page">
  <header class="proj-hero">
    <div class="proj-hero-img">${img(slug, 'cover', { alt: p.photoAlt, sizes: '100vw', eager: true })}<div class="proj-hero-shade"></div></div>
    <div class="container proj-hero-inner">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">/</span> <a href="/work">Work</a> <span aria-hidden="true">/</span> <span class="crumbs-current" aria-current="page">${esc(p.title)}</span></nav>
      <div class="proj-services"><span class="wc-badge${p.concept ? '' : ' wc-badge--client'}">${p.concept ? 'Concept study' : 'Client project'}</span>${p.services.map(s => `<span>${esc(s)}</span>`).join('')}</div>
      <h1 class="proj-title">${esc(p.title)}</h1>
      <p class="proj-tagline">${esc(p.tagline)}</p>
    </div>
  </header>

  <section class="container proj-meta-bar" aria-label="Project details">
    <div class="pm-item"><span>Client</span><strong>${esc(p.client)}</strong></div>
    <div class="pm-item"><span>Sector</span><strong>${esc(p.kind)}</strong></div>
    <div class="pm-item"><span>Year</span><strong>${esc(p.year)}</strong></div>
    <div class="pm-item"><span>Scope</span><strong>${p.services.map(x => SERVICE_LINK[x] ? `<a href="/${SERVICE_LINK[x]}" class="pm-link">${esc(x)}</a>` : esc(x)).join(', ')}</strong></div>
  </section>

  <article class="container proj-body">
    ${p.concept ? '<p class="proj-concept"><strong>Concept study.</strong> A self-initiated project by Ivory Studios to show how we would approach this kind of business. It is not client work, and the figures below are design targets, not results.</p>' : ''}
    <p class="proj-intro">${esc(p.intro)}</p>

    <div class="proj-metrics">
      ${p.metrics.map(m => `<div class="proj-metric"><div class="pmet-val">${esc(m.value)}</div><div class="pmet-label">${esc(m.label)}</div></div>`).join('\n      ')}
    </div>

    <div class="proj-cols">
      <div class="proj-col"><h2 class="proj-h2">The challenge</h2><p>${esc(p.challenge)}</p></div>
      <div class="proj-col"><h2 class="proj-h2">${p.concept ? 'Our approach' : 'What we built'}</h2><p>${esc(p.solution)}</p></div>
    </div>

    <div class="proj-gallery${gallery.length === 1 ? ' proj-gallery--single' : ''}">
      ${gallery.join('\n      ')}
    </div>
    <p class="proj-credit">Photography: Pexels.${p.concept ? ' Images illustrate the sector, not a finished client build.' : ''}</p>

    <div class="proj-stack"><span class="proj-stack-label">Built with</span>${p.stack.map(t => `<span class="stack-pill">${esc(t)}</span>`).join('')}</div>
  </article>

  <section class="proj-next dark-section">
    <div class="container proj-next-inner">
      <div>
        <span class="section-label">Next project</span>
        <a href="/case-studies/${next}" class="proj-next-title">${esc(projects[next].title)} <span aria-hidden="true">→</span></a>
      </div>
      <a href="/contact" class="btn-primary" data-calendly>Discuss your project ${ICON.arrow}</a>
    </div>
  </section>
</main>

<div id="site-footer"></div>

${SCRIPTS}
</body>
</html>
`;
}

// Run
console.log('Ivory Studios build');

for (const [slug, s] of Object.entries(services)) write(`${slug}.html`, chrome(servicePage(slug, s)));

const generated = new Set(SERVICE_PAGES.map(s => `${s}.html`));
const rootPages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !f.startsWith('.') && !generated.has(f));
for (const file of rootPages) {
  let html = chrome(normalise(read(file)));
  html = block(html, 'home-services', serviceCards('h3'));
  html = block(html, 'home-featured', HOME_FEATURED);
  html = block(html, 'services-detail', SERVICES_DETAIL);
  html = block(html, 'work-ld', `  <script type="application/ld+json">${JSON.stringify(WORK_LD)}</script>`);
  html = block(html, 'work-client', WORK_CLIENT);
  html = block(html, 'work-concepts', WORK_CONCEPTS);
  html = block(html, 'process', PROCESS_STEPS);
  write(file, html);
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
  ['/', 'index.html'],
  ['/services', 'services.html'],
  ...SERVICE_PAGES.map(s => [`/${s}`, `${s}.html`]),
  ['/work', 'work.html'],
  ['/about', 'about.html'],
  ['/contact', 'contact.html'],
  ['/website-project-checklist', 'website-project-checklist.html'],
  ...[...clientSlugs, ...conceptSlugs].map(s => [`/case-studies/${s}`, `case-studies/${s}.html`]),
  ['/privacy', 'privacy.html'],
  ['/terms', 'terms.html'],
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
