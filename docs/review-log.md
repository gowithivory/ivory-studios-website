# Ivory Studios site review log

Running log of review cycles. `docs/` is excluded from deployment (`.vercelignore`), so this file is never public.
Status key: ✅ done and verified live · 🔁 checked, no change needed · ⏳ open · ⛔ blocked (needs owner).

## Cycles (newest first)

| # | Issue | Evidence | Change | Checks | Deployed |
|---|---|---|---|---|---|
| 52 | 50-aspect brief: inventory + motion + copy + links | 2,369 components inventoried (docs/component-inventory.json); frame timing A/B; rendered line-length; link destinations | scaleX stat lines; transform/opacity portal pulse; cost guide 60ch; checklist note visible on phones; "See our work" unified; stats grid fixed at 320 px. Details and honest pass counts in docs/website-quality-audit.md | check 29/101, DB 54/54, portal 4/4, focus, taps, motion CLS 0, layout audit clean | see commit |
| 51 | Gmail signature missing; logo broken in Gmail compose and other webmail | Settings showed "No signatures"; compose img naturalWidth 0: site-wide `Cross-Origin-Resource-Policy: same-site` blocks cross-site loads | Recreated "Ivory Studios" signature (logo, name, services, site, teams@, Instagram, LinkedIn), default for new mail and replies on ammar@ and teams@; `vercel.json` now sends CORP `cross-origin` for /assets/img/email-logo.png only (all other assets unchanged) | Reloaded settings: signature + defaults persist; new compose auto-inserts it and the logo loads (96 px); npm run check prod ✅ | yes, verified live |
| 50 | Full fresh re-check (owner asked to check everything again) | Scripted inventory of all 29 sitemap URLs; DNS via dns.google; TLS; compression/TTFB; private paths; Vercel API; Lighthouse ×8; Search Console; Admin; Gmail; Supabase | Added BreadcrumbList + WebPage JSON-LD to /privacy and /terms (only pages without structured data). Verified: 29/29 pages 200, self-canonical, indexable, 1 h1, OG/Twitter, alt text, no duplicate titles/descriptions; DNS A/CNAME/MX/SPF/DKIM/DMARC/verification correct, no extras; TLS Let's Encrypt to Jan 2027 on apex and www; HTTP/2 + Brotli, TTFB ~0.2 s; private files 404; 0 failed deployments, 0 runtime errors; sitemap processed by Google (29 discovered); homepage confirmed "URL is on Google"; DKIM authenticating; Supabase min password length now 8. Found: Gmail signature no longer present (was saved earlier); 2SV enforcement still Off | npm run check prod ✅; Lighthouse mobile 99–100 ×7 pages, desktop home 100 (LCP 0.5 s) | 90a24db, verified live |
| 49 | Second full brief: re-verified, no regressions; remaining gaps | npm audit, prod check, sitemap XML parse, RLS suite, prod form validation run (no submission), Google account security page | No code changes needed. Verified: 0 vulnerabilities (incl. dev); 29/101 prod check; sitemap valid XML (29 URLs); RLS 54/54; contact form validation blocks invalid input with 0 database requests and 0 page errors. Owner items found: admin account has no recovery phone and an unverified recovery email; org 2SV enforcement Off; Supabase minimum password length still 6 (dashboard needs the owner's MFA sign-in) | listed | n/a |
| 48 | Workspace/domain audit | Admin console, Gmail settings, Squarespace overview | Gmail signature "Ivory Studios" (logo, name, site, teams@, Instagram, LinkedIn) created and set as default for new mail and replies on ammar@ and teams@. Verified unchanged: DKIM "Authenticating email with DKIM" in Admin; domain auto-renews 2027-06-15, WHOIS privacy on, domain lock on. Found: org-wide 2-Step Verification enforcement is Off (owner account itself has 2SV on) → recommend owner turns enforcement On. Search Console request-indexing quota still exhausted (retry after 24 h) | settings reloaded and re-read | n/a |
| 47 | Production/infra audit: public duplicate at ivory-studioss.vercel.app (200, full site); manifest icon "any maskable" combined | Vercel API (project, domains, deployments, envs, runtime errors), curl redirect matrix, Lighthouse | vercel.app alias 308 → ivorystudios.io (paths kept); manifest icons split. Verified fine, unchanged: http→https and www→apex 308, trailing slash/.html normalised, HSTS preload + CSP + headers, preview URLs behind Vercel SSO, 0 runtime errors (7 d), envs integration-managed and not in client code, Web Analytics + Speed Insights receiving data daily | npm run check prod 29/101 ✅; Lighthouse mobile home/services/web-development/contact 100/100/100/100, APadel 99; LCP 1.7–1.9 s, CLS 0, TBT 0 | yes, verified live |
| 46 | Round 3 micro-details: mixed label casing, straight quotes, sub-24 px tap targets, titles cutting off the brand, "sign in" vs "Log in", missing form hints and head tags | Text scans, tap sweep at 390 px, title lengths, head-tag counts | Sentence-case labels; curly quotes; breadcrumb/scope/checklist/logo targets ≥ 24 px; 4 titles 52–58 chars; "log in" everywhere; email spellcheck off, length limits, portal autocomplete; theme-color/manifest on portal, og:locale | Site check (local + prod), layout audit 19×12 0 issues, Firefox 22×2, portal 4/4, auth 7/7 (prod), focus 426 stops | f6d305c, verified live |
| 45 | Owner confirmed all live claims; price range is $85–$15,000 across all services | Owner reply 2026-10-23 | Homepage FAQ (+FAQPage), Services FAQ, cost guide updated; Services line implying what the lowest price buys removed | Site check, audit | ✅ (this commit) |
| 44 | "ivory studios" (with a space) doesn't find the site first; "ivorystudios" does | Owner report; web search shows ivorystudios.ca (music school), Ivory (London agency), Ivorie Studios, Ann Ivory Studios competing for the spaced name | Logotype text "Ivory Studios" with a zero-width real space (was one word to crawlers on every page); homepage h1 is the brand line (slogan restyled as paragraph, pixel-identical); footer tagline opens "Ivory Studios:" with services and city | Pixel diff 0; audit; LH 100×4 live | ✅ 6ad2f20 |
| 43 | Brand line on first screen lacked the name | Visible-text count | Eyebrow "Ivory Studios · Design & technology studio in Cairo, working worldwide" (became the h1 in 44) | Wrap at 320/390/1440 | ✅ 6ad2f20 |
| 42 | Heading hierarchy | Script over 31 pages | None needed: one h1 per page, no skipped levels (dashboard h1 is script-rendered; reset page's two h1s are alternate steps) | Scan | 🔁 |
| 41 | 28 case-study gallery images had alt "<Project>: supporting image" | Read markup; viewed every image | Factual descriptions per image (no assumed roles) | Build; live check | ✅ 2b0cc6e |
| 40 | "ivorystudios" (one word, as in the logotype) not in schema | Organization/WebSite alternateName | Added "IvoryStudios" | JSON-LD valid; live | ✅ 9c374ab |
| 39 | Consistency of prices, reply times, timelines, call length | Site-wide extraction | None needed: $1k–$15k, 48h proposal, one working day, 30-minute call, 3–6 weeks agree everywhere | Text scan, 29 pages | 🔁 |
| 38 | One US spelling in portal ("Admin authorization"); site otherwise British | Scan of pages, scripts, attributes | "Admin authorisation" (status keys like `optimization` are DB values, left as is) | node --check | ✅ (this commit) |
| 37 | Work page heading said "Delivered for clients" above one project | Read /work | "Featured client project" | Layout audit /work | ✅ 5210a75 |
| 36 | 404 offered only three generic buttons | Screenshot | Popular pages list (services, APadel, guides, portal) | Status still 404; 2 sizes | ✅ e69bef5 |
| 35 | Guides printed dark, with nav and half-faded sections | Print emulation | Print styles; transitions off in print; Print/PDF button on checklist | Print previews, both guides | ✅ 5945c29 |
| 34 | Booking popup ignored Escape; Calendly cookie banner covered half the popup calendar | Puppeteer + screenshot | Escape closes popup; popup URL gets hide_gdpr_banner like the inline embed | Popup open/close, cursor resumes | ✅ 5945c29 |
| 33 | Contact calendar iframe was 150px tall in a 700px panel (live) | Measured on production | Explicit iframe height (700/640px) | Measured live: 700px | ✅ 59ced89 |
| 32 | Calendly (third-party cookies) and a render-blocking Calendly stylesheet loaded on page open | Request log; Lighthouse Best Practices 79 | Load after first interaction; drop stylesheet from head | 0 requests before interaction; LH 99/100/100/100 | ✅ 59ced89 |
| 31 | No answer to "how much does a website cost" | Search-intent review | /website-cost-guide using only the FAQ's existing range | Audit 12 sizes, LH 100×4, valid Article markup | ✅ 37cc3ac |
| 30 | Navigation between pages felt abrupt | Manual | Cross-document view transitions (off for reduced motion) | Cursor sweep, CLS 0 | ✅ e2ee7b7 |
| 29 | APadel case study thin for the only client project | Read page | Key features list drawn only from existing claims | 2 sizes | ✅ 43df343 |
| 28 | Hero CTA had no risk-reducer | Conversion review | "Free 30-minute call · Fixed-price proposal within 48 hours" | Audit, contrast 100 | ✅ 532a50e |
| 27 | Shared links all showed the same preview | og tags | 22 page-specific share cards | Served 200 image/jpeg, ~60 KB | ✅ ff52017 |
| 26 | About: duplicate "How we work" heading; no service links | Read page | "What we believe"; links to all services | Audit | ✅ 2356a2a |
| 25 | Service descriptions lacked location | Meta review | Cairo in three descriptions (≤160 chars) | Build | ✅ 67a11bb |
| 24 | Services overview headline generic | Copy review | "Five services. One team." | Audit | ✅ (services commit) |
| 23 | Visitors not ready to book had no next step | Funnel review | /website-project-checklist with saved ticks | Persistence test, LH 100×4 | ✅ 6fedd1f |
| 22 | Three intro points repeated stats and comparison | Copy review | "Who we work with" list; after-launch FAQ (+FAQPage) | Audit | ✅ 4e7cd8d |
| 21 | Hero generic; benefits grid didn't show the difference; no mid-page CTA on phones; no work filters | Competitor research | New hero line, comparison table, phone booking bar, work filters | Audit, mobile bar states, filter counts | ✅ c4f2843 |
| 20 | Stats: suffix could show before count; ghost glyphs mid-animation | Frame capture | Suffix on count end; gradient on digits only | 343 frames, 0 early | ✅ 2b780b0 |
| 19 | Case-study descriptions cut mid-sentence | Meta review | Whole-sentence descriptions; scope links; Work ItemList | JSON-LD valid, ≤160 chars | ✅ 2b780b0 |
| 1–18 | Earlier cycles: cursor jump on press (scale + translate), focus rings, error-text leak, portal guidance, robots.txt, admin filter, contact chips, image sizes, related work, stats alignment | See git history 2026-10-22 | — | — | ✅ |

## Open items and blockers

- ✅ **DMARC added 2026-10-23** (owner-approved): TXT `_dmarc` = `v=DMARC1; p=none; rua=mailto:teams@ivorystudios.io`, verified on Squarespace's nameservers and Google public DNS; SPF, DKIM, MX and site verification unchanged. Next step after a few weeks of clean reports: consider `p=quarantine`. DNS is hosted at Squarespace (nameservers nsb1–4.squarespacedns.com). SPF (`include:_spf.google.com ~all`) and DKIM (`google._domainkey`) are present. Suggested TXT at host `_dmarc`: `v=DMARC1; p=none; rua=mailto:teams@ivorystudios.io` (monitor only, blocks nothing).
- ✅ **Custom SMTP live 2026-10-23**: Google Workspace (smtp.gmail.com:587, login ammar@, sender "Ivory Studios" <teams@ivorystudios.io>, app password entered by the owner; 2-Step Verification turned on to allow it). Auth email limit raised from 2/h to 30/h. Test reset email to the owner's account returned 200 with no SMTP error in the auth logs. Branded templates (with the Ivory Studios logo, `assets/img/email-logo.png`) installed for Confirm sign up and Reset password, subjects "Confirm your email for Ivory Studios" / "Reset your Ivory Studios password", verified after reload. ✅ Sender verified end to end 2026-10-23: test reset email arrived from "Ivory Studios <teams@ivorystudios.io>" with the logo loaded. Both templates switched to the site's dark theme (bg #080706, card #100f0c, ivory headings and button, gold accents); confirmed in Gmail at 12:20. Supabase keeps serving the previous template for a few minutes after a save.
- ✅ **teams@ivorystudios.io did not exist** (found 2026-10-23: Gmail bounced mail to it with 550 5.1.1, so the site's contact address, form fallback and DMARC reports had nowhere to go; the account only had team@ and support@ aliases). Owner chose to add it as a free alias of ammar@ in Google Admin; mail to teams@ now arrives (Gmail's confirmation was delivered), and teams@ is a verified "Send mail as" address. Note: Gmail also shows "Reply-to: teams@" on the ammar@ send-as entry; harmless (same inbox), owner can clear it under Settings → Accounts → edit info.
- ⛔ **Admin→client portal test** needs a second account the owner signs up.
- ✅ **Calendly event renamed to "Discovery Call"** (2026-10-23); public link /ammar-ivorystudios/30min unchanged and verified. ⚠️ Calendly shows a **Zoom connection error** on the event location: reconnect Zoom in Calendly or bookings may have no meeting link.
- ✅ **Social links** (owner-confirmed 2026-10-22): Instagram https://www.instagram.com/gowithivory/, LinkedIn https://www.linkedin.com/company/130014150/ (public page for the admin URL supplied), on all pages and in Organization sameAs.
- ✅ "50+ projects delivered" and all other listed claims confirmed by the owner (2026-10-23).
- ⏳ Recommend (needs owner approval, account setting): set Supabase Auth minimum password length to 8 to match the sign-up form (server default is 6).
- ⛔ **Ranking for "Ivory Studios" (spaced) is mostly off-site now.** Owner actions, in order of impact: (1) Google Business Profile named exactly "Ivory Studios", Cairo, category Website designer, linking ivorystudios.io; (2) Search Console: request indexing of the homepage; (3) social profile display names exactly "Ivory Studios" with the site link; (4) consistent listings (Clutch, DesignRush, Sortlist, GoodFirms); (5) a "Website by Ivory Studios" credit link on the APadel site, with the client's permission. No ranking can be guaranteed.
- ✅ **Search Console** (domain property already verified): sitemap resubmitted 2026-10-23 and read the same day (it had last been read 21 Oct with 10 pages; now 29). Index status: 1 indexed; 2 redirects and 1 canonical alternate are expected (www/http); 9 "Discovered – currently not indexed". ⏳ Request indexing for /services, the five service pages, /work, /about, /contact: the daily quota was exhausted on 2026-10-23.
- ✅ **Supabase pausing**: free keep-alive GitHub Action (`.github/workflows/supabase-keepalive.yml`), read-only ping every 3 days, active since 2026-10-23. Backups remain the free-plan limitation.

## Coverage checklist

### Design details (50)

1. ✅ Hero headline scale and line breaks
2. ✅ Hero subcopy specificity
3. ✅ Hero CTA pair and reassurance line
4. ✅ Featured project card in hero
5. ✅ Eyebrow labels (size ≥12px, tracking)
6. ✅ Section heading wipe-up motion
7. ✅ Stats band layout and alignment
8. ✅ Stats counters, units, finish
9. ✅ Stats arrival motion
10. ✅ Intro "Who we work with" list
11. ✅ Service cards on home
12. ✅ Featured client card metrics row
13. ✅ Concept card labels
14. ✅ Comparison table (desktop)
15. ✅ Comparison stacking (phone)
16. ✅ Process steps and rule draw-in
17. ✅ FAQ accordion
18. ✅ Closing CTA band
19. ✅ Footer link groups
20. ✅ Footer sign-off
21. ✅ Custom cursor position on press/drag/refocus
22. ✅ Cursor spring smoothness and idle stop
23. ✅ Card tilt stability
24. ✅ Magnetic buttons
25. ✅ Focus rings on fields, buttons, iframes
26. ✅ Mobile menu (focus trap, Escape, lock)
27. ✅ Phone booking bar
28. ✅ Work filter chips
29. ✅ Related-work row on service pages
30. ✅ Case-study meta bar and scope links
31. ✅ Case-study key features
32. ✅ Concept disclosure box
33. ✅ Service page hero
34. ✅ Service "What you receive" card
35. ✅ About facts card
36. ✅ Contact service chips
37. ✅ Contact form error/success states
38. ✅ Booking calendar sizing
39. ✅ Booking popup
40. ✅ Checklist progress panel
41. ✅ Guide typography and numbering
42. ✅ Print layout for guides
43. ✅ 404 popular pages
44. ✅ Portal status callouts
45. ✅ Portal tracker on phones
46. ✅ Admin filter bar
47. ✅ Admin health panel (collapsed)
48. ✅ Auth pages focus and placeholders
49. ✅ Page transitions
50. ✅ Share cards (OG images)

### Website-wide areas (50)

1. ✅ Positioning (who, what, outcome)
2. ✅ Differentiation
3. ✅ Proof and honesty of claims
4. ✅ Client vs concept labelling
5. ✅ Service explanations
6. ✅ Pricing consistency ($1k–$15k, fixed price, 48h)
7. ✅ Timeline consistency (3–6 weeks, reply in one working day)
8. ✅ Voice and copy clichés
9. ✅ Spelling consistency (British/American)
10. ✅ Navigation and IA
11. ✅ Internal linking
12. ✅ Calls to action placement
13. ✅ Booking flow (inline + popup)
14. ✅ Contact form submission and failures
15. ✅ Form error text safety
16. ✅ Guides / lead nurture
17. ✅ 404 recovery
18. ✅ Mobile layouts (12 sizes)
19. ✅ Large screens
20. ✅ Keyboard navigation
21. ✅ Contrast
22. ✅ Reduced motion
23. ✅ JavaScript-off behaviour
24. ✅ Image alternatives
25. ✅ Titles
26. ✅ Meta descriptions
27. ✅ Canonicals and redirects (www, http)
28. ✅ robots.txt and noindex on portal
29. ✅ Sitemap
30. ✅ Structured data (Organization, Service, FAQ, Article, ItemList)
31. ✅ Open Graph / social previews
32. ✅ Local SEO signals (Cairo)
33. ✅ Performance (Lighthouse)
34. ✅ Image delivery (srcset/sizes)
35. ✅ Third-party scripts (Calendly deferral)
36. ✅ Security headers
37. ✅ Dependency vulnerabilities
38. ✅ Database access rules (54 tests)
39. ✅ Portal client view
40. ✅ Portal admin view
41. ✅ Auth flows (confirm, reset, errors)
42. ⛔ Email templates (SMTP)
43. ⛔ Email authentication (DMARC)
44. ✅ Analytics and tracking
45. ✅ Error handling (network, server)
46. ✅ Privacy (third-party cookies, consent)
47. ✅ Deployment verification
48. ✅ Print
49. ✅ Social profile links (⛔ Instagram handle to confirm)
50. ✅ Maintainability (build-generated pages, docs)
