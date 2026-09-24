/* Ivory Studios — local static server that mirrors production.
   Security headers come straight from vercel.json (single source of truth),
   and only public files are served — never .env, SQL, scripts or docs. */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const vercel = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));

app.disable('x-powered-by');

const globalHeaders = (vercel.headers.find(h => h.source === '/(.*)') || { headers: [] }).headers;
app.use((req, res, next) => {
  for (const { key, value } of globalHeaders) res.setHeader(key, value);
  // upgrade-insecure-requests / HSTS would break plain-http localhost
  res.setHeader('Content-Security-Policy',
    String(res.getHeader('Content-Security-Policy')).replace('; upgrade-insecure-requests', ''));
  res.removeHeader('Strict-Transport-Security');
  next();
});

// Legacy URLs → canonical (same intent as the vercel.json redirects).
app.get('/project(.html)?', (req, res) => {
  const slug = String(req.query.slug || '');
  res.redirect(301, /^[a-z0-9-]+$/.test(slug) ? `/case-studies/${slug}` : '/work');
});

// Public surface only.
const PUBLIC_ROOT_FILES = /^\/(robots\.txt|sitemap\.xml|site\.webmanifest|[a-z-]+\.html)$/;
const PUBLIC_DIRS = /^\/(assets|case-studies)\//;
app.use((req, res, next) => {
  const p = decodeURIComponent(req.path);
  if (p === '/' || PUBLIC_DIRS.test(p) || PUBLIC_ROOT_FILES.test(p) || /^\/[a-z0-9-]+$/.test(p)) return next();
  res.status(404).send('Not found');
});

app.use(express.static(__dirname, {
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

app.use((req, res) => res.status(404).send('Not found'));

app.listen(PORT, () => console.log(`Ivory Studios → http://localhost:${PORT}`));
