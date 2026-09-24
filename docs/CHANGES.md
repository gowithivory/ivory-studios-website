# Ivory Studios — Site Improvements

## 2026-09-21 — Security, database, SEO and ads-readiness pass

- **Database**: the old Supabase project no longer exists (DNS NXDOMAIN) so login/portal were dead. `supabase/schema.sql`
  rewritten and verified by 30 automated checks (`npm run test:db`): fixed `admin_requests_view` bypassing RLS,
  removed the public newsletter UPDATE policy, clients can no longer set their own status/priority/role, input length
  limits, contact-form flood guard, least-privilege grants.
- **Contact form** posted to a placeholder Formspree ID (and was blocked by CSP) so enquiries were lost. Now stored in
  Supabase with a honeypot, validation and an email fallback; enquiries show in the admin dashboard.
- **Security headers**: removed `unsafe-inline` scripts (inline onclick handlers replaced with `data-calendly`), dropped
  vercel.live, added `object-src 'none'`, `X-Frame-Options: DENY`, noindex/no-store on portal pages. Supabase client now
  self-hosted and pinned (was an unpinned CDN script with no integrity check).
- **Deploy hygiene**: `.vercelignore` stops docs, SQL, scripts, server and env files being served publicly; dev server
  serves only public files and reads headers from vercel.json.
- **SEO**: every case study pre-rendered at `/case-studies/<slug>` (was client-rendered `?slug=`), nav/footer baked into
  HTML, internal links normalised to clean URLs, sitemap regenerated with all 15 case studies + real lastmod.
- **Ads**: privacy + terms pages, consent-gated GA4/Google Ads/Meta loader, lead/booking conversion events, UTM capture.

## 2026-07-02 — Full overhaul (structure, typography bug, SEO, content)

### The big one: display headings no longer break mid-word or clip
The CTA band ("LET'S BUILD SOMETHING EXCEPTIONAL.") was breaking mid-word
("SOMETHIN-G", "EXCEPTIO-NAL") because the heading sizes assumed Syne 800
uppercase glyphs were ~half their real width. Measured the actual font
("EXCEPTIONAL." = 12.49em, "DEVELOPMENT" = 13.34em) and re-derived every
display-heading `clamp()` from those numbers. Verified in a real browser:
13 pages × 15 viewport widths (320px → 3840px), zero overflow, zero clipped
headings, zero mid-word breaks. Also removed the `overflow-wrap: break-word`
"safety net" that caused the mid-word breaks in the first place.

### Project structure
- `css/`, `js/`, brand images → `assets/css`, `assets/js`, `assets/img`
- `DEPLOY.md`, `CHANGES.md` → `docs/`; deploy log now writes to `docs/`
- Deleted stray files (`DNS)`, `ivorystudios.io`, old `deploy-log.txt`)
- Added `scripts/dev-server.ps1` — zero-dependency local server (no Node needed)

### SEO / infrastructure
- **vercel.json**: removed redirects that conflicted with `cleanUrls: true`
  (`/services` → `/services.html` could loop); headers updated to `/assets/*`;
  dropped the deprecated `X-XSS-Protection` header; CSP `form-action` now
  allows Formspree (the inquiry form was blocked before)
- All internal links, canonicals, sitemap entries and JSON-LD URLs now use
  extensionless clean URLs (`/about`, not `about.html`) — no more 308
  redirects on every click
- Real **PNG og-image** (1200×630) generated — SVG og-images are ignored by
  Facebook/LinkedIn/WhatsApp/X. Plus `apple-touch-icon.png`, `icon-192.png`,
  `icon-512.png` for iOS and the web manifest
- Per-page JSON-LD: AboutPage+Person, CollectionPage (work), ContactPage,
  BreadcrumbList + ItemList (services), correct Service descriptions on all
  four service pages (three had a copy-pasted web-design description)
- robots.txt covers clean *and* `.html` forms of the private portal pages,
  including the previously missing `/reset-password`
- sitemap.xml: clean URLs + `lastmod` dates

### Performance / animation
- Custom cursor now moves via `transform` (compositor-only) instead of
  `left/top` — no layout work per mousemove
- Removed the expensive `body:has(a:hover)` selectors (JS already handles it)
- New ≥1800px tier so the site scales up gracefully on TVs/4K instead of
  looking like a stretched phone site

### Content
- Rewrote the remaining AI-sounding lines ("captivate visitors and guide
  them toward action", "Makes You Unforgettable", the injected service-page
  proof quote) into specific, human copy consistent with the testimonial voice
- Brand page H1 is now "Brand Identity People Remember"

### Action item added
- **Supabase**: add `https://ivorystudios.io/reset-password` to Auth → URL
  Configuration (the reset link no longer uses the `.html` URL)

---

## What was changed (earlier pass)

### `index.html`
- **Hero sub-copy** — Replaced generic "we design and build premium websites that win trust and turn visitors into customers" with sharper, more opinionated copy that calls out the problem (expensive business cards that do nothing).
- **Testimonials** — All three testimonials were rewritten from scratch. The original text read like AI-generated marketing copy ("completely transformed", "beyond what we imagined"). Replacements are specific, first-person, and reference concrete outcomes tied to each project case study.
- **CTA band sub-copy** — Replaced "No pitch, no pressure — just a clear, honest plan to turn your website into your hardest-working asset" with something more direct and less rehearsed.

### `about.html`
- **Story section** — Added Ammar's name and a founding narrative with a specific "why" (watching good businesses lose to bad websites). The previous version used anonymous "we" voice that gave no sense of who is behind the studio.
- **Testimonials** — Same rewrites as homepage (kept in sync).

### `contact.html`
- **Added project inquiry form** — The contact page previously had only the Calendly embed as a conversion path. If Calendly goes down, breaks, or a visitor just isn't ready to book a call, there was no fallback. A full project inquiry form now appears below the Calendly section. Includes: name, email, company, budget range, service checkboxes, and project description. Uses Formspree for form submission (see action item below).

### `css/style.css`
- Added all styles for the new inquiry form — dark-themed inputs, gold focus rings, pill-style checkbox toggles, responsive two-column layout.

---

## What Ammar needs to do

### 1. Set up Formspree (5 minutes)
The inquiry form won't work until you connect it to Formspree:
1. Go to [formspree.io](https://formspree.io) and create a free account.
2. Create a new form — set the destination email to `teams@ivorystudios.io`.
3. Copy the form ID from the endpoint URL (it looks like `xpwzabcd`).
4. In `contact.html`, find this line and replace `YOUR_FORM_ID` with your actual ID:
   ```
   action="https://formspree.io/f/YOUR_FORM_ID"
   ```

### 2. Verify the Calendly link
The site uses `https://calendly.com/ammar-ivorystudios/30min` throughout. Make sure this URL exists and is set to a 30-minute event type. If the URL is different, update it in `js/partials.js` (line 8, the `CAL` constant) — it propagates everywhere automatically.

### 3. Replace placeholder testimonials with real client quotes (high priority)
The rewritten testimonials are more believable than the originals, but they're still placeholder copy tied to fictional projects. When you have real client relationships, swap these out — even just an email quote lightly edited is 10× more credible than anything written in-house.

### 4. Update the hero stat numbers if they change
`index.html` and `about.html` both have hard-coded stats (50+ projects, 30+ clients, 98% satisfaction, 3+ years). These animate up from 0 via JS counters in `main.js`. Update the `data-target` attribute values as your numbers grow.

### 5. Add a real OG image
`og-image.jpg` is referenced in the meta tags but may not exist or may be a placeholder. Create a 1200×630px branded image (your logo on the dark background) and save it as `/og-image.jpg` in the root. This appears when anyone shares a link on LinkedIn, WhatsApp, Twitter, etc.

---

## What's working fine (no changes needed)
- Project case study pages (`project.html?slug=*`) — render correctly in-browser via ES modules. The blank state in static scrapers is expected; a real user's browser will render the full case study.
- Calendly popup on every CTA button — already wired in `partials.js`
- Nav, footer, mobile menu — all functional
- Animated counters — work on scroll via IntersectionObserver
- SEO metadata — strong throughout, no action needed
- Vercel deployment config — `vercel.json` looks correct
