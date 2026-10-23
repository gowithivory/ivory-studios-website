// Site checks with no dependencies (Node 18+ fetch).
//   npm run check                        -> against http://localhost:3001 (run `npm run dev` first)
//   npm run check -- https://ivorystudios.io
// Exits 1 if anything fails, so it can gate a deploy.

const BASE = (process.argv[2] || 'http://localhost:3001').replace(/\/$/, '');
const ORIGIN = 'https://ivorystudios.io';
const fails = [];
const fail = (where, msg) => fails.push(`${where}: ${msg}`);

// Network blips are retried; a page that still can't be reached is reported, not thrown.
const get = async (path, opts = {}) => {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(BASE + path, { redirect: 'manual', signal: AbortSignal.timeout(20000), ...opts });
      return { status: res.status, headers: res.headers, text: opts.method === 'HEAD' ? '' : await res.text() };
    } catch (err) {
      if (attempt < 3) { await new Promise(r => setTimeout(r, 1500 * attempt)); continue; }
      return { status: `unreachable (${err.cause?.code || err.name})`, headers: new Headers(), text: '' };
    }
  }
};

// 1. Every page in the sitemap loads and has the basics.
const sitemap = (await get('/sitemap.xml')).text;
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(ORIGIN, '') || '/');
if (pages.length < 20) fail('sitemap', `only ${pages.length} URLs`);

const titles = new Map();
const links = new Set();
for (const path of pages) {
  const { status, text } = await get(path);
  if (status !== 200) { fail(path, `HTTP ${status}`); continue; }
  const title = text.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = text.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canonical = text.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (!title) fail(path, 'no <title>');
  else if (!/Ivory Studios/.test(title)) fail(path, `title lacks "Ivory Studios": ${title}`);
  if (title) { if (titles.has(title)) fail(path, `duplicate title with ${titles.get(title)}`); titles.set(title, path); }
  if (!desc) fail(path, 'no meta description');
  else if (desc.length > 165) fail(path, `description ${desc.length} chars`);
  else if (/…$/.test(desc)) fail(path, 'description cut off with an ellipsis');
  if (canonical !== ORIGIN + (path === '/' ? '/' : path)) fail(path, `canonical ${canonical}`);
  const mains = (text.match(/<main[\s>]/g) || []).length;
  if (mains !== 1) fail(path, `${mains} <main> landmarks`);
  const h1s = (text.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(path, `${h1s} h1 elements`);
  if (!text.includes('<span>Ivory<span class="logo-gap"> </span>')) fail(path, 'logo text is not "Ivory Studios"');
  for (const m of text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { fail(path, `invalid JSON-LD: ${e.message}`); }
  }
  for (const m of text.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="/.test(m[0])) fail(path, `img without alt: ${m[0].slice(0, 80)}`);
    if (/alt="[^"]*supporting image"/.test(m[0])) fail(path, 'placeholder alt text');
  }
  if (/instagram\.com\/ivorystudios|linkedin\.com\/company\/gowithivory/.test(text)) fail(path, 'outdated social link');
  for (const m of text.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) links.add(m[1]);
}

// 2. Every internal link and asset resolves (redirects count as broken here).
for (const path of links) {
  const { status } = await get(path, { method: 'HEAD' });
  if (status !== 200) fail(`link ${path}`, `HTTP ${status}`);
}

// 3. Pages that must not be indexed, a real 404, and private files.
for (const path of ['/login', '/signup', '/dashboard', '/reset-password']) {
  const { status, text, headers } = await get(path);
  if (status !== 200) fail(path, `HTTP ${status}`);
  if (!/noindex/.test(text) && !/noindex/.test(headers.get('x-robots-tag') || '')) fail(path, 'missing noindex');
}
if ((await get('/this-page-does-not-exist')).status !== 404) fail('404', 'missing page does not return 404');
if (BASE.startsWith('https://')) {
  for (const path of ['/docs/review-log.md', '/scripts/build.mjs', '/supabase/schema.sql', '/package.json']) {
    if ((await get(path, { method: 'HEAD' })).status === 200) fail(path, 'private file is public');
  }
  const headers = (await get('/', { method: 'HEAD' })).headers;
  for (const h of ['content-security-policy', 'strict-transport-security', 'x-content-type-options', 'referrer-policy']) {
    if (!headers.get(h)) fail('/', `missing ${h} header`);
  }
}

// 4. Key facts stay consistent wherever they appear.
const home = (await get('/')).text;
if (!/data-count="50"/.test(home)) fail('/', 'projects-delivered figure changed');
if (!home.includes('Ivory Studios · Design')) fail('/', 'brand h1 missing');

console.log(`${pages.length} pages, ${links.size} internal links checked against ${BASE}`);
if (fails.length) { console.error(`${fails.length} problem(s):\n` + fails.map(f => '  - ' + f).join('\n')); process.exit(1); }
console.log('All checks passed.');
