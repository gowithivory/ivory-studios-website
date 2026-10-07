// Local dev server that behaves like the Vercel deployment:
// same security headers (read from vercel.json), clean URLs, and only the
// public files are reachable. Run with `npm run dev`.
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const ROOT = __dirname;
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));

app.disable('x-powered-by');

const globalHeaders = (vercel.headers.find(h => h.source === '/(.*)') || { headers: [] }).headers;
app.use((req, res, next) => {
  for (const { key, value } of globalHeaders) res.setHeader(key, value);
  // HSTS and upgrade-insecure-requests break plain-http localhost.
  res.setHeader('Content-Security-Policy',
    String(res.getHeader('Content-Security-Policy')).replace('; upgrade-insecure-requests', ''));
  res.removeHeader('Strict-Transport-Security');
  next();
});

// Vercel Analytics only exists on Vercel. Serve empty scripts locally.
app.get('/_vercel/*', (req, res) => res.type('js').send(''));

// Old URLs, same as the redirects in vercel.json.
app.get('/project(.html)?', (req, res) => {
  const slug = String(req.query.slug || '');
  res.redirect(301, /^[a-z0-9-]+$/.test(slug) ? `/case-studies/${slug}` : '/work');
});

// Only the public site is served. Never .env, SQL, scripts or docs.
const PUBLIC_ROOT_FILES = /^\/(robots\.txt|sitemap\.xml|site\.webmanifest|favicon\.ico|[a-z0-9-]+\.html)$/;
const PUBLIC_DIRS = /^\/(assets|case-studies)\//;
const notFound = (req, res) => res.status(404).sendFile(path.join(ROOT, '404.html'));

app.use((req, res, next) => {
  let p;
  try { p = decodeURIComponent(req.path); } catch { return notFound(req, res); }
  if (p === '/' || PUBLIC_DIRS.test(p) || PUBLIC_ROOT_FILES.test(p) || /^\/[a-z0-9-]+$/.test(p)) return next();
  notFound(req, res);
});

app.use(express.static(ROOT, {
  extensions: ['html'],
  dotfiles: 'deny',
  index: 'index.html',
  redirect: false,
  setHeaders(res, filePath) {
    res.setHeader('Cache-Control', /\.(jpg|jpeg|png|svg|webp|woff2?|ico)$/.test(filePath)
      ? 'public, max-age=604800'
      : 'no-cache');
  },
}));

app.use(notFound);

app.listen(PORT, () => console.log(`Ivory Studios running at http://localhost:${PORT}`));
