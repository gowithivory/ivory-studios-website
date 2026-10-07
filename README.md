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
2. If you touched a page, the nav/footer or `content/projects.mjs`, run `npm run build:html`. It bakes the shared nav and footer into every page, renders the case studies and updates `sitemap.xml`.
3. Commit and push to `main`. Vercel deploys it in about a minute.

```bash
git add -A
git commit -m "Update services copy"
git push
```

Adding a case study: add an entry to `content/projects.mjs`, then `npm run build:html`.

## Layout

```
*.html              pages (nav/footer are generated, edit them in scripts/build.mjs)
case-studies/       generated from content/projects.mjs, don't edit by hand
assets/css|js|img   styles, scripts, images
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
