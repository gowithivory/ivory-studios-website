# Ivory Studios Website

The marketing and portfolio site for [Ivory Studios](https://ivorystudios.io) — a design agency that builds fast, considered digital products.

## Stack

| Layer | Technology |
|---|---|
| Pages | Plain HTML5 |
| Styles | Vanilla CSS (`assets/css/style.css`) |
| Scripts | Vanilla JS ES modules (`assets/js/`) |
| Database / Auth | Supabase (client portal & project dashboard) |
| Booking | Calendly embed |
| Local dev server | Express (`server.js`) |
| Hosting | Vercel (static, no build step) |

## Local development

**Prerequisites:** [Node.js](https://nodejs.org) v18+, [Git](https://git-scm.com)

```bash
# 1. Clone the repo
git clone https://github.com/gowithivory/ivory-studios-website.git
cd ivory-studios-website

# 2. Install the dev server dependency
npm install

# 3. Start the local server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

The Express server serves all HTML files with clean URLs (no `.html` extension needed), security headers, and sensible caching — matching production behaviour as closely as possible.

**No Node installed?** There's a zero-dependency fallback that needs nothing but Windows:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\dev-server.ps1
```

Open [http://localhost:3005](http://localhost:3005) — same clean-URL behaviour.

## Deployment

The site deploys automatically to Vercel on every push to `main`. No build step required — Vercel serves the static files directly using the config in `vercel.json`.

See [docs/DEPLOY.md](./docs/DEPLOY.md) for first-time setup instructions, or double-click `DEPLOY.bat` on Windows.

## Editing pages (build step)

Nav, footer, clean URLs, case-study pages and `sitemap.xml` are generated into the HTML so search
engines see them without running JavaScript. After editing any page, or `content/projects.mjs`:

```bash
npm run build:html   # idempotent; rewrites only files that changed
npm run test:db      # re-verifies the 30 database access rules after any schema change
```

- Add a case study: add an entry to `content/projects.mjs`, then `npm run build:html`.
- Deploy only ships the public site — `.vercelignore` keeps `docs/`, `supabase/`, `scripts/`, `content/`, `server.js` and env files out of production.

## Database (Supabase, free tier)

Setup takes ~5 minutes: see [supabase/SETUP.md](./supabase/SETUP.md). The two constants live at the
top of `assets/js/supabase.js` (anon key only — it is public by design and protected by row-level security).

## Ads & analytics

`assets/js/track.js` is off until you add IDs (GA4 / Google Ads / Meta Pixel). Once set, a consent banner
appears and nothing loads until a visitor accepts. Contact-form leads and Calendly bookings fire conversions,
and UTM / gclid / fbclid values are attached to each enquiry.
