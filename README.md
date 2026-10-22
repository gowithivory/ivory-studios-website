# ivorystudios.io

Source for the [Ivory Studios](https://ivorystudios.io) website: marketing pages, case studies and the client portal.

Plain HTML, CSS and JavaScript. No framework, no build step on the server. Supabase handles auth and the portal database, Vercel hosts it.

## Run it locally

Needs Node 18+.

```bash
npm install
npm run dev        # http://localhost:3001
```

The dev server uses the same headers and clean URLs as production (`server.js` reads `vercel.json`).

## Making changes

1. Edit the HTML/CSS/JS.
2. If you touched a page, the nav/footer, `content/projects.mjs` or `content/services.mjs`, run `npm run build:html`. It bakes the shared nav and footer into every page, renders the service pages and case studies, fills the generated blocks on the home, services and work pages, and updates `sitemap.xml`.
3. Run the site checks: `npm run check` (local, with `npm run dev` running) and, for the database rules, `npm run test:db`. After a deploy, `npm run check -- https://ivorystudios.io` checks production.
4. Commit and push to `main`. Vercel deploys it to production in about a minute. Other branches get a preview deployment.

```bash
git add -A
git commit -m "Update services copy"
git push
```

Adding a case study: add an entry to `content/projects.mjs`, add its images to `assets/img/work/` as WebP (`<slug>-cover-800.webp`, `<slug>-cover-1600.webp`, `<slug>-1-800.webp`, `<slug>-1-1200.webp`, …), then `npm run build:html`. The build fails if an image is missing. Mark self-initiated work with `concept: true` so it is labelled as a concept study.

Editing a service: change its entry in `content/services.mjs`, then `npm run build:html`. Service pages are generated, so don't edit `web-design.html` and friends by hand.

## Layout

```
*.html              pages (nav/footer are generated, edit them in scripts/build.mjs)
case-studies/       generated from content/projects.mjs, don't edit by hand
content/            projects.mjs (case studies), services.mjs (service pages)
assets/css|js|img   styles, scripts, images (project photos: assets/img/work)
assets/fonts        self-hosted Syne + Inter
supabase/           schema, reset script, RLS tests, setup notes
scripts/build.mjs   static build
server.js           local dev server
vercel.json         headers, redirects, caching
```

`.vercelignore` keeps everything except the public site out of the deployment.

## Database

Setup is in [supabase/SETUP.md](supabase/SETUP.md). After changing `supabase/schema.sql`, run the access-rule tests:

```bash
npm run test:db
```

Then paste the schema into the Supabase SQL editor and run it (it's safe to re-run).

## Analytics

`assets/js/track.js` stays off until you fill in a GA4, Google Ads or Meta Pixel ID. Once one is set, a cookie banner appears and nothing loads until the visitor accepts.

## Checks and review notes

- `npm run check [url]` loads every page in the sitemap and checks titles, descriptions, canonicals, one h1, the "Ivory Studios" logo text, valid JSON-LD, image alt text, internal links, noindex on portal pages, the 404 page and (on production) security headers and that private files stay unpublished. It exits 1 on any problem.
- `npm run test:db` runs the row-level security suite (54 tests) against an in-memory Postgres.
- `docs/` (not deployed) holds the review log, the 30-area checklist and the off-site SEO guide.
- The Supabase library is self-hosted and pinned in `assets/js/vendor/supabase.min.js`; its version and hash are noted in `assets/js/supabase.js`.

