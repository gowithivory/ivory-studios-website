# 30-area review: 10 passes per area

Persistent checklist for the full-site review. `docs/` is not deployed.
Status: ✅ verified, no issue · 🔧 fixed and verified (commit) · ⏳ pending · ⛔ blocked (needs owner) · n/a with reason.
Evidence is from tests run on 2026-10-22 against production (https://ivorystudios.io) unless marked "local".
Priority: P1 broken/insecure · P2 real user impact · P3 polish.

## Baseline (Phase 1)

- 34 HTML pages (29 public in sitemap; portal pages noindex), static site + build script (`npm run build:html`), Supabase (auth + Postgres + RLS), Vercel (push to main deploys in ~1 min).
- Analytics (Vercel, 1–22 Oct): ~50 visitors; Google 18 visitors, direct 29, Facebook 1. Top: / (79 views), /work, /services, /login. Custom events need Vercel Pro.
- Runtime errors (Vercel, 7 days): none.
- Lighthouse mobile, production: all 14 public pages Performance 99–100, Accessibility/Best Practices/SEO 100; desktop 100×4. Login Accessibility 95 (fixed), SEO 54 by design (noindex).
- Security headers: CSP, HSTS (preload), X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy on every page type.
- Browsers available for testing: Chrome, Firefox 158. Safari needs "Allow Remote Automation" (admin password) ⛔.

---

## 1. Content and copywriting
| # | Question | Evidence | Status |
|---|---|---|---|
| 1.1 | Does the first screen say who, what, outcome? | Hero line rewritten; read at 390/1440 | 🔧 c4f2843 |
| 1.2 | Generic/cliché phrasing? | Scan for 15 clichés across pages | ✅ only owner-supplied "ambitious" |
| 1.3 | Repetition between sections? | Intro points duplicated stats/table | 🔧 4e7cd8d |
| 1.4 | Service pages specific about deliverables? | Read all five; "What you receive" lists | ✅ |
| 1.5 | Spelling consistency (British)? | Scan pages, scripts, attributes | 🔧 61ecffc (1 fix) |
| 1.6 | Claims consistent (price, timing, call)? | Extraction across 29 pages | ✅ |
| 1.7 | Headings say something specific? | "Find the right solution", "Everything your business needs" | 🔧 ecd8ded, services commit |
| 1.8 | Microcopy on forms and errors helpful and safe? | Contact failure modes; auth messages | 🔧 29fea20 |
| 1.9 | Guides useful, not thin? | Checklist (30 items), cost guide (8 drivers) | ✅ |
| 1.10 | Portal copy tells clients what happens next? | Off-path status notes | 🔧 29fea20 |

## 2. Brand identity and consistency
| # | Question | Evidence | Status |
|---|---|---|---|
| 2.1 | Name written "Ivory Studios" in text everywhere? | Logo text, h1, footer | 🔧 6ad2f20 |
| 2.2 | Slogans used consistently? | "Your Vision, Brought to Life." / "We Build. You Grow." in hero, intro, footer | ✅ |
| 2.3 | Colour tokens consistent? | Gold/ivory tokens reused for new components | ✅ |
| 2.4 | Typography consistent (Syne display, Inter text, Inter numerals)? | Numerals rule; new components use tokens | ✅ |
| 2.5 | Share images on-brand? | 22 cards, same template | 🔧 ff52017 |
| 2.6 | Social profiles correct? | Owner-confirmed IG/LinkedIn | 🔧 5e2f775 |
| 2.7 | Booking event name matches site ("Discovery Call")? | Calendly event is "Free Strategy Call" | ⛔ owner to rename in Calendly |
| 2.8 | Voice consistent across portal/emails? | Email templates drafted in site voice; not live | ⛔ SMTP |
| 2.9 | Logo renders identically after text change? | Pixel diff 0 | ✅ |
| 2.10 | Favicon/manifest/touch icon present and branded? | 6 icon/manifest URLs 200; manifest name "Ivory Studios" | ✅ |

## 3. UI design
| # | Question | Evidence | Status |
|---|---|---|---|
| 3.1 | Stats band alignment and hierarchy | Measured offsets 0 px | 🔧 0f9d39d, 0f04dd1 |
| 3.2 | Featured card balance | Metrics row | 🔧 2b780b0 |
| 3.3 | Comparison table legibility | Column widths, stacking | 🔧 c4f2843 |
| 3.4 | Contact chips padding/colour | Specificity bug | 🔧 925fd6c |
| 3.5 | Portal card header wrap | Pill overflow at 375 | 🔧 29fea20 |
| 3.6 | Focus states visible | Fields, iframes | 🔧 29fea20, 584aecb |
| 3.7 | Empty/loading states styled | Portal "No updates yet", calendar placeholder | ✅ |
| 3.8 | 404 page useful | Popular pages | 🔧 e69bef5 |
| 3.9 | Print styles for guides | Print previews | 🔧 5945c29 |
| 3.10 | Spacing rhythm between sections consistent? | Measured 8 pages × 2 sizes: 128 px desktop / 72 px phone; tight 24 px tops only under compact heroes, by design | ✅ |

## 4. UX and navigation
| # | Question | Evidence | Status |
|---|---|---|---|
| 4.1 | Primary nav covers main journeys? | Services, Work, About, Contact, Login, Book | ✅ |
| 4.2 | Mobile menu: trap, Escape, lock, return focus | Test | ✅ |
| 4.3 | Legacy URLs redirect (/project, /home, service.html) | /project → 308 | ✅ |
| 4.4 | Breadcrumbs on deep pages | Service, case study, guides | ✅ |
| 4.5 | Dead ends? (every page has a next step) | Case studies "Next project" + CTA; guides CTA | ✅ |
| 4.6 | 404 recovery | Popular pages | 🔧 e69bef5 |
| 4.7 | Work filtering | Filters + counts | 🔧 c4f2843 |
| 4.8 | Footer findability of guides | Footer links | 🔧 6fedd1f, 37cc3ac |
| 4.9 | Signed-in user hitting /login goes to dashboard | auth.js getSession redirect (code) | ⏳ needs session ⛔ |
| 4.10 | Back/forward cache restores clean state | Earlier cursor/tilt fixes | ✅ |

## 5. First impressions and trust
| # | Question | Evidence | Status |
|---|---|---|---|
| 5.1 | Real client work clearly shown | APadel featured, features list | 🔧 43df343 |
| 5.2 | Concept work clearly labelled | 14 studies, disclosure box | ✅ |
| 5.3 | Unverifiable claims? | "50+ projects" owner figure | ⛔ owner-verified only |
| 5.4 | Risk reducers near CTAs | Hero assurance line | 🔧 532a50e |
| 5.5 | Contact details visible (email, city) | Footer, contact | ✅ |
| 5.6 | Privacy/terms reachable | Footer links | ✅ |
| 5.7 | Testimonials | None exist; none invented | ✅ n/a |
| 5.8 | Security indicators (HTTPS, no mixed content) | upgrade-insecure-requests, HSTS | ✅ |
| 5.9 | "Who we work with" clarity | Intro list | 🔧 4e7cd8d |
| 5.10 | Brand consistency across socials/directories | Off-site | ⛔ owner (guide written) |

## 6. Animations and motion design
| # | Question | Evidence | Status |
|---|---|---|---|
| 6.1 | Cursor stable on press/drag/refocus | 210 presses, 0.00 px | 🔧 b88d636 |
| 6.2 | Cursor smoothness/idle | Spring; 0 idle rAF | 🔧 b88d636 |
| 6.3 | Reduced motion respected | Test: no anims/reveals hidden | ✅ |
| 6.4 | Stats motion correct order | 343 frames | 🔧 2b780b0 |
| 6.5 | Motion causes no layout shift | CLS 0 on most pages | ✅ |
| 6.6 | Page transitions | View transitions; off for reduced motion | 🔧 e2ee7b7 |
| 6.7 | Entrances don't hurt LCP | riseIn transform-only | ✅ |
| 6.8 | Print disables motion | Print fix | 🔧 5945c29 |
| 6.9 | Touch devices get no hover-only effects | No cursor/tilt/magnetic | ✅ |
| 6.10 | Motion in Firefox | 22 pages × 2 sizes: reveals complete, counters 50/5/48/100, units visible, cursor present | ✅ |

## 7. Images and media
| # | Question | Evidence | Status |
|---|---|---|---|
| 7.1 | Gallery alt text meaningful | 28 rewritten | 🔧 2b0cc6e |
| 7.2 | Cover alt text meaningful | photoAlt per project | ✅ |
| 7.3 | srcset/sizes accurate | Featured card sizes | 🔧 0f9d39d |
| 7.4 | Modern formats (WebP) | All work images WebP | ✅ |
| 7.5 | width/height attributes (no CLS) | Build sets them | ✅ |
| 7.6 | Lazy loading below the fold | loading=lazy except hero | ✅ |
| 7.7 | Photo credit/licensing stated | "Photography: Pexels" on case studies | ✅ |
| 7.8 | OG images per page | 22 cards | 🔧 ff52017 |
| 7.9 | Image weight per page reasonable | /work 329 KB total | ✅ |
| 7.10 | Decorative images hidden from AT | aria-hidden on decorative SVG/grid | ✅ |

## 8. Responsive design
| # | Question | Evidence | Status |
|---|---|---|---|
| 8.1 | 12 viewports × all pages: overflow/clip/collide | 34 pages × 12 sizes on production: no overflow, clipping or collisions | ✅ |
| 8.2 | Heading fits at 320–375 | "difference" fix | 🔧 c4f2843 |
| 8.3 | Portal at 375 | Tracker/pill fixes | 🔧 29fea20 |
| 8.4 | Comparison stacks on phones | Screens | ✅ |
| 8.5 | Large screens (1800+) | Container 1440 | ✅ |
| 8.6 | Hero assurance on phones | Two-line split | 🔧 532a50e |
| 8.7 | Phone booking bar doesn't cover key UI | States test | ✅ |
| 8.8 | Landscape phones (844×390) | Included in the 34-page audit: clean | ✅ |
| 8.9 | Tablet (768/1024) | Included in the 34-page audit: clean | ✅ |
| 8.10 | Calendar sizes on phone | 640 px | 🔧 59ced89 |

## 9. Interactions and functionality
| # | Question | Evidence | Status |
|---|---|---|---|
| 9.1 | Contact form all paths | Success/abort/500/rate/double | ✅ |
| 9.2 | Booking inline + popup | Sizes, Escape | 🔧 59ced89, 5945c29 |
| 9.3 | Work filter | Counts, hidden-without-JS | ✅ |
| 9.4 | Checklist ticks persist, print | Tests | ✅ |
| 9.5 | FAQ accordions | Keyboard + click | ✅ |
| 9.6 | Mobile menu | Test | ✅ |
| 9.7 | Admin filter/health | Harness | 🔧 925fd6c |
| 9.8 | Counters correct in all scroll modes | Test | ✅ |
| 9.9 | No uncaught JS errors in Firefox | Supabase lock error on 4 pages; verified gone live | 🔧 8be26ff |
| 9.10 | Real admin→client update visible | Needs second account | ⛔ |

## 10. Accessibility
| # | Question | Evidence | Status |
|---|---|---|---|
| 10.1 | Lighthouse a11y 100 on public pages | 14 pages | ✅ |
| 10.2 | Auth pages a11y | link-in-text-block | 🔧 3424c23 |
| 10.3 | Keyboard focus visible everywhere | kbd sweep | ✅ |
| 10.4 | Heading hierarchy | Scan 31 pages | ✅ |
| 10.5 | Alt text | Gallery fix | 🔧 2b0cc6e |
| 10.6 | Form labels/errors announced | aria-describedby, aria-invalid | ✅ |
| 10.7 | Dialog Escape (popup) | Fix | 🔧 5945c29 |
| 10.8 | Reduced motion | Test | ✅ |
| 10.9 | Contrast of small dim text | LH contrast 1 | ✅ |
| 10.10 | Screen-reader names for icon links | aria-labels on socials | ✅ |

## 11. On-page SEO
| # | Question | Evidence | Status |
|---|---|---|---|
| 11.1 | Unique titles ≤ ~60 chars | Scan | 🔧 (title fix) |
| 11.2 | Descriptions complete sentences | Case studies | 🔧 2b780b0 |
| 11.3 | One h1 per page with topic | Scan; home h1 brand | 🔧 6ad2f20 |
| 11.4 | Brand "Ivory Studios" in visible text | Logo/h1/footer | 🔧 6ad2f20 |
| 11.5 | Location in service descriptions | Cairo | 🔧 67a11bb |
| 11.6 | Image alts | Fix | 🔧 2b0cc6e |
| 11.7 | Search-intent content (cost, planning) | Guides | 🔧 37cc3ac, 6fedd1f |
| 11.8 | No keyword stuffing | Read | ✅ |
| 11.9 | Thin pages? | Concept studies ~250 words + specifics | ✅ |
| 11.10 | Anchor text descriptive | "Read the study", service names | ✅ |

## 12. Technical SEO
| # | Question | Evidence | Status |
|---|---|---|---|
| 12.1 | Canonicals | All public pages | ✅ |
| 12.2 | www/http redirects | 308 to https apex | ✅ |
| 12.3 | robots.txt | No longer blocks noindex pages | 🔧 29fea20 |
| 12.4 | Sitemap complete | 29 URLs incl. guides | ✅ |
| 12.5 | noindex on portal | X-Robots-Tag + meta | ✅ |
| 12.6 | 404 status for missing pages | 404 | ✅ |
| 12.7 | Clean URLs, no .html duplicates | cleanUrls | ✅ |
| 12.8 | Legacy URL redirects | /project etc. | ✅ |
| 12.9 | Private files not public (docs, scripts, supabase) | 404 | ✅ |
| 12.10 | Search Console status | No access; owner steps in docs/off-site-seo-guide.md | ⛔ |

## 13. Structured data
| # | Question | Evidence | Status |
|---|---|---|---|
| 13.1 | All JSON-LD parses | Scan | ✅ |
| 13.2 | Organization accurate (no invented fields) | Read | ✅ |
| 13.3 | alternateName incl. IvoryStudios | Added | 🔧 9c374ab |
| 13.4 | sameAs correct profiles | Updated | 🔧 5e2f775 |
| 13.5 | FAQPage matches visible FAQ | Parity check | ✅ |
| 13.6 | Service schema per service page | Present | ✅ |
| 13.7 | CreativeWork per case study | Present | ✅ |
| 13.8 | Work CollectionPage/ItemList | Added | 🔧 2b780b0 |
| 13.9 | Article on guides | Added | 🔧 6fedd1f, 37cc3ac |
| 13.10 | WebSite @id linkage | Added | 🔧 2b780b0 |

## 14. Internal links and authority
| # | Question | Evidence | Status |
|---|---|---|---|
| 14.1 | Services → case studies | Related work | 🔧 0f9d39d |
| 14.2 | Case studies → services | Scope links | 🔧 2b780b0 |
| 14.3 | About → services | Links | 🔧 2356a2a |
| 14.4 | Home FAQ → guides | Links | 🔧 67a11bb, 37cc3ac |
| 14.5 | Contact → checklist | Link | 🔧 6fedd1f |
| 14.6 | Broken internal links | 104 checked, 0 bad | ✅ |
| 14.7 | Orphan pages | Every public page linked from nav/footer/grids | ✅ |
| 14.8 | 404 links to key pages | Popular pages | 🔧 e69bef5 |
| 14.9 | External links valid | Socials, Calendly | ✅ |
| 14.10 | Backlinks/citations | Off-site | ⛔ owner (guide) |

## 15. Local and international SEO
| # | Question | Evidence | Status |
|---|---|---|---|
| 15.1 | Address in schema (Cairo, EG) | Organization | ✅ |
| 15.2 | Location in copy | Eyebrow, footer, descriptions | 🔧 6ad2f20, 67a11bb |
| 15.3 | areaServed Worldwide | Schema | ✅ |
| 15.4 | Languages stated (EN/AR) | Schema contactPoint, contact page | ✅ |
| 15.5 | hreflang | Single English site; not applicable | ✅ n/a |
| 15.6 | Google Business Profile | Off-site | ⛔ owner (guide) |
| 15.7 | Directory consistency (NAP) | Off-site | ⛔ owner (guide) |
| 15.8 | Currency/pricing clarity for international buyers | USD ranges | ✅ |
| 15.9 | Time zone clarity for bookings | Calendly shows visitor time zone | ✅ |
| 15.10 | Arabic content | None; a business decision | ⛔ owner decision |

## 16. Loading speed
| # | Question | Evidence | Status |
|---|---|---|---|
| 16.1 | Page weight per page | 132–329 KB mobile | ✅ |
| 16.2 | Third-party on load (Calendly) | Deferred to interaction | 🔧 59ced89 |
| 16.3 | Render-blocking third-party CSS | Removed | 🔧 59ced89 |
| 16.4 | Supabase on contact | Lazy | 🔧 8be26ff |
| 16.5 | Supabase blocking on portal pages | Deferred | 🔧 3424c23 |
| 16.6 | Font preload | Syne/Inter preloaded | ✅ |
| 16.7 | Caching headers | assets revalidate; images 7d | ✅ |
| 16.8 | Compression | Vercel gzip/brotli | ✅ |
| 16.9 | Image sizes match display | Fix | 🔧 0f9d39d |
| 16.10 | JS/CSS size | style.css 24 KB and main.js 8 KB transferred (brotli) after dead-CSS removal | ✅ |

## 17. Core Web Vitals
| # | Question | Evidence | Status |
|---|---|---|---|
| 17.1 | LCP ≤ 2.5 s mobile lab | 1.6–2.0 s | ✅ |
| 17.2 | CLS ≤ 0.1 | 0–0.05 | ✅ |
| 17.3 | TBT/INP proxy | 0–10 ms | ✅ |
| 17.4 | LCP element sensible | hero-sub text | ✅ |
| 17.5 | Field data | Speed Insights collects real-user vitals into the owner's Vercel dashboard; no API access here, lab data used | ⛔ owner dashboard |
| 17.6 | Desktop vitals | 0.4–0.5 s LCP | ✅ |
| 17.7 | Interaction latency of filters/menu | Synchronous, tiny | ✅ |
| 17.8 | Throttled LCP local | 1.8 s | ✅ |
| 17.9 | CLS from counters | Reserved width | ✅ |
| 17.10 | CLS on brand-identity 0.05 | 3 reruns: CLS 0 (one-off variance) | ✅ |

## 18. Frontend optimization
| # | Question | Evidence | Status |
|---|---|---|---|
| 18.1 | rAF loops stop when idle | 0 idle frames | ✅ |
| 18.2 | Listeners passive where scroll-related | main.js | ✅ |
| 18.3 | No unused third-party scripts | Tags only after consent (none configured) | ✅ |
| 18.4 | Module/defer order correct | Tests | ✅ |
| 18.5 | Dead CSS | 369 classes checked; 4 dead components removed (2 KB); dynamic h-* kept | 🔧 9f616cd |
| 18.6 | Duplicate code paths | Unused-function scan: none | ✅ |
| 18.7 | IntersectionObserver used for reveals | yes | ✅ |
| 18.8 | Image decoding async | yes | ✅ |
| 18.9 | Preconnects needed? | Self-hosted fonts; none needed | ✅ |
| 18.10 | Service worker/offline | Not needed for this site | ✅ n/a |

## 19. Backend performance
| # | Question | Evidence | Status |
|---|---|---|---|
| 19.1 | Supabase auth latency | Health panel ~450 ms | ✅ |
| 19.2 | Indexes on hot queries | user_id, request_id(+created_at/position), created_at indexes match every portal query | ✅ |
| 19.3 | N+1 queries in portal | Milestones fetched in one .in() | ✅ |
| 19.4 | Health checks not on every load | On demand | 🔧 925fd6c |
| 19.5 | Contact insert minimal | return=minimal | ✅ |
| 19.6 | Rate limiting on contact | DB trigger | ✅ |
| 19.7 | Static hosting (no server functions) | No runtime errors | ✅ |
| 19.8 | Free-tier pausing risk | Supabase docs: Free projects pause after 7 days of low activity; traffic is low | ⛔ owner decision (Pro plan or keep-alive) |
| 19.9 | Realtime not used | — | ✅ n/a |
| 19.10 | Storage buckets | None used | ✅ n/a |

## 20. Code quality
| # | Question | Evidence | Status |
|---|---|---|---|
| 20.1 | Syntax checks pass | node --check on 13 scripts: pass | ✅ |
| 20.2 | Generated pages from single source | build.mjs | ✅ |
| 20.3 | Comments explain why | Reviewed diffs | ✅ |
| 20.4 | No secrets in repo | Tree + full history scan (secret/service keys, JWTs, private keys): none | ✅ |
| 20.5 | README accurate after changes | Added checks, docs, vendor note | 🔧 e05de65 |
| 20.6 | Dead code | CSS cleaned; no unused JS functions | 🔧 9f616cd |
| 20.7 | Consistent naming | Reviewed | ✅ |
| 20.8 | Vendor pinned and recorded | Version + hash comment | 🔧 8be26ff |
| 20.9 | Tests exist for critical logic | RLS 54 | ✅ |
| 20.10 | Regression tests in repo | `npm run check` (proven to fail on injected faults) | 🔧 e05de65 |

## 21. Application security
| # | Question | Evidence | Status |
|---|---|---|---|
| 21.1 | Security headers | All page types | ✅ |
| 21.2 | CSP strictness | No unsafe-inline scripts | ✅ |
| 21.3 | XSS in portal rendering | esc() on all data | ✅ |
| 21.4 | Error text leakage | friendly() | 🔧 29fea20 |
| 21.5 | Dependency vulnerabilities | npm audit 0 | ✅ |
| 21.6 | Vendored lib current | 2.117.3 | 🔧 8be26ff |
| 21.7 | Honeypot/rate limit on form | Yes | ✅ |
| 21.8 | Open redirects | Confirm redirect fixed; Supabase allow-list | ✅ |
| 21.9 | Clickjacking | frame-ancestors none | ✅ |
| 21.10 | Secrets exposure | Only the publishable key ships; history clean | ✅ |

## 22. Authentication
| # | Question | Evidence | Status |
|---|---|---|---|
| 22.1 | Wrong password message | Chrome + Firefox | ✅ |
| 22.2 | Signup validation | Test | ✅ |
| 22.3 | Signed-out dashboard redirect | Test | ✅ |
| 22.4 | Forged token rejected and cleared | Test | ✅ |
| 22.5 | Expired confirm link | Test | ✅ |
| 22.6 | Reset request non-enumerating | Test | ✅ |
| 22.7 | Server-side min password = form (8) | Needs dashboard approval | ⛔ |
| 22.8 | Real login/logout/session persistence | Needs credentials | ⛔ |
| 22.9 | Branded confirmation/reset emails | Needs SMTP | ⛔ |
| 22.10 | Firefox auth start-up errors | Fixed | 🔧 8be26ff |

## 23. Database integrity
| # | Question | Evidence | Status |
|---|---|---|---|
| 23.1 | RLS suite | 54/54 | ✅ |
| 23.2 | Constraints (status, progress 0–100, dates) | Tests | ✅ |
| 23.3 | Triggers log changes | Tests | ✅ |
| 23.4 | Cascade deletes (milestones) | Schema | ✅ |
| 23.5 | Production schema matches repo | Verified at migration | ✅ |
| 23.6 | Orphaned rows | Impossible by design: every child FK cascades on delete; created_by set null | ✅ |
| 23.7 | Contact table growth/abuse | Flood trigger | ✅ |
| 23.8 | Timestamps server-set | Triggers | ✅ |
| 23.9 | Backups | Free plan: no automatic downloadable backups (secondary sources) | ⛔ owner decision |
| 23.10 | Migration repeatability | schema.sql idempotent | ✅ |

## 24. Permissions and privacy
| # | Question | Evidence | Status |
|---|---|---|---|
| 24.1 | Anonymous reads denied (5 tables) | Live test | ✅ |
| 24.2 | Cross-client isolation | RLS tests | ✅ |
| 24.3 | Role escalation blocked | Guard trigger tests | ✅ |
| 24.4 | Internal notes hidden from clients | Tests | ✅ |
| 24.5 | Third-party cookies before consent | Calendly deferred | 🔧 59ced89 |
| 24.6 | Privacy policy accurate | Cookie settings claim, Calendly cookies, browser storage, Google Workspace corrected | 🔧 bdfaf17 |
| 24.7 | Analytics cookieless | Vercel | ✅ |
| 24.8 | PII in logs/screenshots | None committed | ✅ |
| 24.9 | Checklist data stays local | localStorage only | ✅ |
| 24.10 | Admin is only owner account | Verified earlier | ✅ |

## 25. Reliability and recovery
| # | Question | Evidence | Status |
|---|---|---|---|
| 25.1 | Form fallback when backend down | mailto fallback | ✅ |
| 25.2 | Calendar fallback link | "Open booking page" | ✅ |
| 25.3 | Library load failure on contact | Falls back to mailto | ✅ |
| 25.4 | Rollback path | Vercel instant rollback | ✅ |
| 25.5 | Runtime errors | None (7 days) | ✅ |
| 25.6 | Uptime monitoring | None; proposed daily `npm run check` via GitHub Actions | ⛔ owner approval |
| 25.7 | DB backups/export | Needs DB password or Pro plan | ⛔ owner |
| 25.8 | Supabase pause risk | See 19.8 | ⛔ owner decision |
| 25.9 | Portal error states | Failing-backend stand-in: clear message, no spinner; added Try again | 🔧 52a1309 |
| 25.10 | Build fails on missing images | build.mjs check | ✅ |

## 26. Conversion optimization
| # | Question | Evidence | Status |
|---|---|---|---|
| 26.1 | CTA above the fold | Hero | ✅ |
| 26.2 | Risk reducers | Hero, CTA band | 🔧 532a50e |
| 26.3 | Mid-page CTA on phones | Booking bar | 🔧 c4f2843 |
| 26.4 | Path for not-ready visitors | Guides | 🔧 6fedd1f, 37cc3ac |
| 26.5 | Differentiation visible | Comparison | 🔧 c4f2843 |
| 26.6 | Form friction | 3 required fields | ✅ |
| 26.7 | Booking friction | Inline calendar full height | 🔧 59ced89 |
| 26.8 | Per-service CTAs | "Explore X", service page CTAs | ✅ |
| 26.9 | Conversion tracking | Events need Pro / GA not configured | ⛔ owner decision |
| 26.10 | Exit paths on 404 | Popular pages | 🔧 e69bef5 |

## 27. Portfolio and case studies
| # | Question | Evidence | Status |
|---|---|---|---|
| 27.1 | Client vs concept labelled | Everywhere | ✅ |
| 27.2 | Concept figures framed as targets | Disclosure | ✅ |
| 27.3 | Client project depth | Features list | 🔧 43df343 |
| 27.4 | Work heading accuracy | "Featured client project" | 🔧 5210a75 |
| 27.5 | Descriptions/meta | Fix | 🔧 2b780b0 |
| 27.6 | Images alt | Fix | 🔧 2b0cc6e |
| 27.7 | Filtering | Added | 🔧 c4f2843 |
| 27.8 | Next-project navigation | Present | ✅ |
| 27.9 | Credits (Pexels) | Present | ✅ |
| 27.10 | More real client work | Owner content | ⛔ |

## 28. Analytics and tracking
| # | Question | Evidence | Status |
|---|---|---|---|
| 28.1 | Page views recorded | Vercel data | ✅ |
| 28.2 | Conversion events | Need Vercel Pro or GA4 ID | ⛔ |
| 28.3 | Consent banner only if tags configured | Yes | ✅ |
| 28.4 | UTM attribution captured on enquiries | track.js | ✅ |
| 28.5 | Speed Insights | Script present | ✅ |
| 28.6 | Search Console | No access | ⛔ |
| 28.7 | 404 tracking | Vercel shows /project hits | ✅ |
| 28.8 | Analytics privacy | Cookieless | ✅ |
| 28.9 | Referrer data | google.com 18 visitors | ✅ |
| 28.10 | Dashboard for owner | Vercel Analytics | ✅ |

## 29. Cross-browser compatibility
| # | Question | Evidence | Status |
|---|---|---|---|
| 29.1 | Firefox layout key pages | 6 pages × 2 sizes clean | ✅ |
| 29.2 | Firefox interactions | Menu, filter, checklist | ✅ |
| 29.3 | Firefox auth | Flows pass | 🔧 8be26ff |
| 29.4 | Safari | Needs Remote Automation | ⛔ |
| 29.5 | :has() support fallbacks | Used for decoration only | ✅ |
| 29.6 | View transitions fallback | Progressive | ✅ |
| 29.7 | background-clip:text | Chrome glitch fixed | 🔧 2b780b0 |
| 29.8 | Firefox all pages | 22 pages × 2 sizes clean (only Calendly's own cookie notices) | ✅ |
| 29.9 | Touch emulation | Tests | ✅ |
| 29.10 | Older browser graceful degradation | No JS → content visible | ✅ |

## 30. QA and maintenance
| # | Question | Evidence | Status |
|---|---|---|---|
| 30.1 | Full layout audit | Found uncaught view-transition error on /dashboard (fixed 3212b89, verified live); /services timeouts were test load, re-tested clean | 🔧 3212b89 |
| 30.2 | Link check | 104 internal, 0 bad | ✅ |
| 30.3 | Lighthouse sweep | 19 runs | ✅ |
| 30.4 | RLS tests | 54/54 | ✅ |
| 30.5 | Review log maintained | docs/review-log.md | ✅ |
| 30.6 | Dependency freshness | Vendor upgraded | 🔧 8be26ff |
| 30.7 | Runbook for owner | off-site guide, SETUP.md | ✅ |
| 30.8 | Regression test scripts in repo | `npm run check` | 🔧 e05de65 |
| 30.9 | Monitoring/alerts | Vercel runtime errors: none; scheduled check proposed | ⛔ owner approval |
| 30.10 | Final cross-page regression | npm run check (prod) pass; RLS 54/54; auth flows Chrome+Firefox; cursor 210 presses 0.00 px; portal harness; Lighthouse home 99/100/100/100, contact/work 100×4, APadel 99/100×3, login 100/100/100/54 (noindex) | ✅ |

---

## Round 2: second pass through all seven phases (2026-10-23)

Each phase reviewed again from a different angle: real visitor journeys instead of single pages, attacker probes, claim origins, desktop density, screen-reader structure, real throttling.

| Phase | Pass | Evidence | Result |
|---|---|---|---|
| 1 | Analytics since the first round | Vercel: visitors reached every service page, Work, About, Contact | ✅ |
| 1 | Three phone journeys (hire, portfolio, not-ready) by tapping real links | All complete on production, no errors | ✅ |
| 1 | Page transitions on real link clicks | Never ran: opt-in late in the stylesheet, every navigation aborted with an uncaught error | 🔧 380d5df (6/6 transition, 0 errors, reduced motion off) |
| 1 | Contact on a phone: are the actions on the first screen? | Calendar and form both below a 3-step explainer | 🔧 a60bd7d (Pick a time / Send a brief) |
| 2 | Private files reachable? (.git, .env, configs, schema, docs) | 13 paths 404; vendor dir → 404 | ✅ |
| 2 | Form limits vs database constraints | 4000-char message + prefixes < 4500 DB limit; other fields match | ✅ |
| 2 | Public auth configuration | Email only, confirmation required, anonymous sign-in off | ✅ |
| 2 | Backend latency | Auth ~0.2 s, REST ~0.2–0.6 s, site TTFB ~0.2 s; project active | ✅ |
| 3 | Where did each capability claim come from? | 6 from the original site; several from the 21 Oct rewrite | ⛔ docs/confirm-claims.md sent to owner |
| 4 | Services overview density at desktop | List columns 228 px, items wrapping every 3–4 words | 🔧 6a1ff46 |
| 4 | Regression from that change | Audit caught clipped "Development" at 1440 | 🔧 25854d9 (titles sized to column; Firefox verified) |
| 4 | Featured APadel card on desktop | Facts squeezed to ~110 px, labels 4 lines | 🔧 3825482 (rows; ≤2 lines) |
| 5 | Landmarks, live regions, labels, autocomplete, ids on 14 page types | No <main> on guides/legal; sign-up/reset messages not announced | 🔧 6cf5a3a (visual delta ≤1/255) |
| 5 | In-content internal links per page | About had none | 🔧 3458aa9 ("Meet the studio"; check now requires one <main>) |
| 6 | Real throttling (slow 4G, 4× CPU) | LCP 1.2–1.6 s, CLS 0 on home, work, APadel, services, contact (one 2.3 s outlier did not repeat) | ✅ |
| 7 | Full regression on production | npm run check (29 pages, 101 links); RLS 54/54; 3 phone journeys; transitions 6/6 + reduced motion off, 0 errors; landmarks (auth pages have no footer by design); auth flows 7/7; cursor 210 presses 0.00 px; portal 4/4 | ✅ |

## Round 3: micro-details (2026-10-23)

| Phase | Check | Found | Result |
|---|---|---|---|
| 1 | Button labels across site, auth and portal | Mixed Title Case and sentence case ("Send Reset Link", "Submit Request") | 🔧 sentence case everywhere; "Book a Discovery Call" kept as the brand CTA |
| 1 | Typographic punctuation in visible text | 50 straight apostrophes, 14 straight double quotes | 🔧 0 straight left in text (attributes, code and JSON-LD validity checked) |
| 2 | Form fields: autocomplete, length limits, spellcheck | Emails spell-checked; sign-up name unbounded; portal phone/company had no autocomplete | 🔧 |
| 2 | External links and mailto | All `_blank` links have `noopener`; one mailto address throughout | ✅ |
| 3 | Terminology | "Sign in" in 4 messages vs "Log in" on buttons | 🔧 "log in" everywhere |
| 3 | Typography scan (repeated words, double spaces, number-range hyphens, stray spaces before punctuation) | None | ✅ |
| 4 | Tap targets at 390 px (WCAG 2.5.8, 24 px) | Breadcrumbs 21 px, project-scope links 19 px, checklist buttons 21 px, logo 23 px | 🔧 all ≥ 24 px without moving layout |
| 4 | Focus indicator on every tab stop | 426 stops on 11 pages | ✅ all visible |
| 5 | Title length | 4 titles 61–65 chars, cutting "Ivory Studios" in results | 🔧 52–58 chars (homepage kept: only "Cairo" at risk) |
| 5 | Head tags | Portal pages had no theme-color/manifest; no og:locale anywhere | 🔧 |
| 5 | Images | 77/77 have width, height, loading hint and async decoding | ✅ |
| 6 | Cache headers | Unversioned CSS/JS revalidate; fonts immutable; images 7 days | ✅ deliberate |
