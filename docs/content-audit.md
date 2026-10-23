# Content and copy audit (2026-10-23)

## Scope actually covered
Rendered copy was extracted in reading order (headings, paragraphs, list items, buttons, labels, FAQ answers opened) and read in full for: home, services, web design, web development, brand identity, CRM & business systems, SEO & growth, work, about, contact, APadel, Velluto (representative concept study; the other 13 share its template and labelling), website cost guide, project checklist, privacy, terms, 404, the shared nav and footer, contact form messages and auth/portal messages (assets/js/contact.js, auth.js). Titles, meta and social descriptions were checked for every sitemap page.

**Honest note on "50 passes":** each page was read once in full against the brief's 50 dimensions (clarity, organisation, persuasion, CTA consistency, accuracy, SEO, tone …), plus automated scans (buzzwords, vague CTAs, repeated sentences, length, duplicates). That is one deep review per page, not 50 separate passes. Much of the copy was already rewritten and owner-verified in earlier rounds (docs/confirm-claims.md); it was preserved where it was already doing its job.

## Content strategy in use
- **Positioning:** a small design and technology studio in Cairo, working worldwide, that plans website, brand and business systems as one team, at a fixed price agreed before work starts.
- **Audience:** established businesses whose site undersells them; founders launching; teams outgrowing spreadsheets.
- **Voice:** clear, direct, confident, plain English; benefits before features; honest limits (no ranking guarantees, concept studies labelled).
- **Terminology:** Web Design · Web Development · Brand Identity · CRM & Business Systems · SEO & Growth; "discovery call"; "project brief"; "fixed-price proposal"; "log in"; "client portal".

## Changes (before → after)
| Where | Before | After | Why |
|---|---|---|---|
| Home, intro line | "Ivory Studios designs and builds fast, search-ready websites, distinctive brand identities and custom business systems for ambitious businesses." | "Ivory Studios plans your website, brand and business systems as one team, so they work together from the start instead of being patched together by three different suppliers." | Third restatement of the service list on one screen; now explains the one-team advantage |
| Home, meta description | "Ivory Studios turns ambitious ideas into distinctive websites, brands and custom business systems. A Cairo-based design and technology studio working worldwide." | "Ivory Studios designs and builds websites, brand identities and custom CRM systems for growing businesses. Cairo-based, working worldwide, at a fixed price." | Concrete services and the searched term "CRM"; dropped vague "ambitious ideas" |
| Home, social descriptions | "…designed and built to move your business forward." | "…designed and built by one team at a fixed price agreed upfront." | Specific instead of generic |
| CRM page benefit | "Role-based access and row-level security, so each person sees only what they should." | "Each person sees only what their role allows, enforced by the database itself rather than just hidden on screen." | Same fact, plain language for business owners |
| Nav + footer (all pages) | "Business Systems" | "CRM & Business Systems" | Matches the page, services list and search term |
| Contact header button | "Send a brief" | "Send a project brief" | One name for one action site-wide |
| Login error | "Wrong email or password." | "That email and password don’t match. Try again, or reset your password below." | Tells the person what to do next |
| Auth unavailable message ×4 | "Sign-in is temporarily unavailable…" | "Logging in is temporarily unavailable…" | Site uses "log in" everywhere |
| Earlier today | "Explore our work" | "See our work" | One label per action |

## Reviewed and kept (already doing its job)
Hero (owner-provided slogan and brand line), comparison table, process steps, FAQs, all five service pages' problem statements and benefits, case-study and concept-study copy (labelled honestly), cost guide, checklist (fact-checked: 10 steps, 30 items), form validation and success messages, 404.

## Needs the owner's confirmation
1. **"Founded in 2026" next to "50+ projects delivered".** Both are owner-confirmed, but together they invite doubt. If the 50+ includes work before the studio, a wording such as "50+ projects delivered by the team" would be accurate; not changed without your say-so.
2. **No testimonials or client quotes anywhere.** The biggest trust gap. Add only real, permissioned quotes (APadel would be the obvious first).
3. **X and Facebook profiles** linked in the footer are empty (X's only post is unrelated). Post or remove the links.

## Verification
npm run check (29 pages, 101 links); layout audit on home, contact, CRM, about, services at 12 sizes: 0 issues; login flow shows the new message; rewritten text confirmed in the rendered pages.
