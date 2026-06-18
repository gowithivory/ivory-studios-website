/* Ivory Studios — static server with sensible security + caching.
   No framework magic: just Express, a few headers, long-cache assets. */
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Don't advertise the stack.
app.disable('x-powered-by');

// ─── Security headers ──────────────────────────────────────────
// CSP is scoped to exactly the origins this site actually talks to:
// Supabase (api/auth), Calendly (booking), Pexels (imagery), Google
// Fonts, and the Supabase JS CDN. Everything else is denied.
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://assets.calendly.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.calendly.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://images.pexels.com https://*.supabase.co https://assets.calendly.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://calendly.com",
    "frame-src https://calendly.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// ─── Static assets, cached hard (immutable content-addressed in prod) ──
app.use(express.static(path.join(__dirname), {
  extensions: ['html'],
  etag: true,
  lastModified: true,
  setHeaders(res, filePath) {
    if (/\.(jpg|jpeg|png|svg|webp|woff2?|ico)$/.test(filePath)) {
      // Images/fonts rarely change → cache hard.
      res.setHeader('Cache-Control', 'public, max-age=604800');
    } else {
      // HTML/CSS/JS revalidate every load (fast 304s via ETag) so edits
      // show up immediately and visitors never run stale code.
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

app.listen(PORT, () => console.log(`Ivory Studios → http://localhost:${PORT}`));
