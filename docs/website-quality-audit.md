# Website quality audit (50-aspect brief, 2026-10-23)

## What was actually done, stated plainly

- **Inventory:** 29 public pages, **2,369 components** at 1440 px (the same set re-measured at 390 px = 4,738 measured instances). Every component has an ID of the form `<page>#<section>/<kind><n>` (e.g. `/#s1-hero/cta1`). Full list: `docs/component-inventory.json`.
- **Passes:** each component received **one automated multi-aspect pass at two viewports** plus the targeted manual reviews below. **No component has 50 documented passes.** Running 50 genuine passes on 2,369 components (≈118,000 reviews) is not feasible; inventing them would be fake. Previous rounds (docs/review-30-areas.md, cycles 1–51 in docs/review-log.md) already covered many of these components by hand.
- **Aspects checked automatically on every applicable component:** rendered contrast (29), font size (23), line height (25), characters per line (27), heading hierarchy (28, 46), alt text (44), accessible names (44), form labels (44), tap size at 390 px (45), horizontal overflow (45), visibility in final state (41, 48), link destination and external-link handling (47). Aspects 1–20 (content and persuasion) were reviewed by hand at site level (copy scan below), not per sentence × 50.

## Components per page

| Page | Sections | Headings | Text | CTAs | Links | Images | Fields | Total |
|---|---|---|---|---|---|---|---|---|
| / | 11 | 24 | 42 | 7 | 40 | 4 | 0 | 128 |
| /services | 7 | 26 | 69 | 5 | 35 | 0 | 0 | 142 |
| /web-design | 10 | 23 | 34 | 8 | 33 | 3 | 0 | 111 |
| /web-development | 10 | 23 | 34 | 8 | 33 | 3 | 0 | 111 |
| /brand-identity | 10 | 23 | 34 | 8 | 33 | 3 | 0 | 111 |
| /business-systems | 10 | 23 | 35 | 8 | 34 | 3 | 0 | 113 |
| /seo-growth | 10 | 23 | 34 | 8 | 33 | 3 | 0 | 111 |
| /work | 6 | 22 | 29 | 9 | 40 | 15 | 0 | 121 |
| /about | 7 | 16 | 31 | 4 | 30 | 0 | 0 | 88 |
| /contact | 5 | 6 | 17 | 5 | 34 | 0 | 11 | 78 |
| /website-project-checklist | 4 | 15 | 50 | 6 | 26 | 0 | 30 | 131 |
| /website-cost-guide | 4 | 16 | 28 | 4 | 27 | 0 | 0 | 79 |
| /case-studies/apadel | 6 | 7 | 17 | 3 | 32 | 2 | 0 | 67 |
| /case-studies/novatech | 6 | 6 | 12 | 3 | 29 | 3 | 0 | 59 |
| /case-studies/lumiere | 6 | 6 | 12 | 3 | 31 | 3 | 0 | 61 |
| /case-studies/harvest | 6 | 6 | 12 | 3 | 30 | 3 | 0 | 60 |
| /case-studies/vertex | 6 | 6 | 12 | 3 | 30 | 3 | 0 | 60 |
| /case-studies/velluto | 6 | 6 | 12 | 3 | 30 | 3 | 0 | 60 |
| /case-studies/brightsmile | 6 | 6 | 12 | 3 | 30 | 3 | 0 | 60 |
| /case-studies/forgefit | 6 | 6 | 12 | 3 | 31 | 3 | 0 | 61 |
| /case-studies/kavana | 6 | 6 | 12 | 3 | 31 | 3 | 0 | 61 |
| /case-studies/pulseboard | 6 | 6 | 12 | 3 | 29 | 3 | 0 | 59 |
| /case-studies/lexford | 6 | 6 | 12 | 3 | 31 | 3 | 0 | 61 |
| /case-studies/azurepalms | 6 | 6 | 12 | 3 | 31 | 3 | 0 | 61 |
| /case-studies/wanderly | 6 | 6 | 12 | 3 | 31 | 3 | 0 | 61 |
| /case-studies/atlas | 6 | 6 | 12 | 3 | 31 | 3 | 0 | 61 |
| /case-studies/granite | 6 | 6 | 12 | 3 | 31 | 2 | 0 | 60 |
| /privacy | 4 | 12 | 25 | 2 | 27 | 0 | 0 | 70 |
| /terms | 4 | 12 | 17 | 2 | 28 | 0 | 0 | 63 |

## Findings and decisions

| ID | Aspect(s) | Finding (evidence) | Decision |
|---|---|---|---|
| motion-01 | 48 | Scroll frame timing on 8 pages × 2 viewports: median 16.7 ms (60 fps), CLS 0.000, nothing left invisible; isolated single dropped frames on image-heavy pages | A/B with blur off and clip-path off: drops unchanged (2–15 either way) → headless rendering noise, not the effects. **Kept.** |
| motion-02 | 48 | `.fact-kicker::before` animated `width` (layout per frame) | **Changed** to `transform: scaleX()`; visually identical, verified 24 px final |
| motion-03 | 48 | Portal active phase dot pulsed `box-shadow` forever (repaint every frame) | **Changed** to a hollow ring pseudo-element animated with transform + opacity; verified running |
| motion-04 | 48 | Cursor ring/dot animate width/height on hover | **Kept**: tiny fixed elements, tuned in earlier rounds; converting to scale would thicken the ring border |
| motion-05 | 48 | Two progress bars animate width (portal %, checklist) | **Kept**: user-triggered, one-off, border radius would distort under scaleX |
| motion-06 | 12 (reduced motion) | Global reduced-motion rule stops all animation and shows all revealed content; looping animations (caret, live dot, phase pulse) covered | **Verified**, no change |
| type-01 | 27 | Cost guide body ran ~99 characters per line (measured from rendered line boxes) | **Changed**: `max-width: 60ch` → 73–80 cpl |
| type-02 | 25 | Home intro statement line-height 1.25 flagged | **Kept**: 38 px display text, 1.25 is correct |
| ux-01 | 15, 41, 45 | Checklist note "progress stays in this browser only" was hidden on phones (only privacy note on the page) | **Changed**: shown above the list on phones; sticky bar stays 110 px; desktop unchanged; one copy per layout so screen readers hear it once |
| copy-01 | 17, 20 | Work CTA said the same thing two ways ("Explore our work" / "See our work") | **Changed** to "See our work". "See all work" kept where it follows example projects (promises the full list) |
| copy-02 | 9, 13 | Buzzword scan (cutting-edge, seamless, elevate, synergy, world-class …) and vague CTA scan (learn more, click here …) | **None found** |
| copy-03 | 19 | Same sentence on 4+ pages: concept-study disclaimer (required labelling), shared process steps | **Kept** (intentional) |
| link-01 | 47 | 39 unique link targets; internal all 200 (npm run check); Calendly, Instagram, LinkedIn 200; all external links new-tab with noopener | **Verified** |
| link-02 | 7, 15 | Footer also links Facebook and X. Both are real Ivory Studios accounts, but empty (0 followers; X's only post is an unrelated waitlist message) | **Kept**; owner decision whether to post or drop the links |
| a11y-01 | 29, 44 | Contrast: 0 failures; text <12 px: 0; skipped heading levels: 0; images without alt: 0; unlabeled fields: 0 | **Verified** |
| a11y-02 | 44 | Inline guide links reported no visible text | False positive: they sit inside closed FAQ answers |
| layout-02 | 36, 45 | Pre-existing (identical before/after today's changes): at 320 px the 2-column stats grid was 5 px wider than the viewport (right column to 325 px), clipping the box edge; `1fr` columns could not shrink below "100%" at 46 px | **Changed**: `repeat(2, minmax(0, 1fr))` + 40 px numbers at ≤360 px → grid 20–300 px, content fits; home layout audit clean at 6 sizes |
| layout-01 | 45 | "Overflow" in 11 sections | False positive: page scrollWidth − viewport = 0 everywhere; only the hero glow (clipped on purpose) |

## Tests run on the final code

npm run check (local and production), database rules 54/54, portal harness 4/4, keyboard focus sweep, tap targets at 390 px, motion/frame measurement, layout audit (19 pages × 12 viewports). All passed: npm run check (29 pages, 101 links), DB 54/54, portal 4/4, focus visible on every stop, no tap targets under 24 px, CLS 0 and no stuck reveals; full layout audit found one issue (layout-02), fixed and re-audited clean.

## Remaining

- Per-sentence × 50 copy passes were not done; the site copy was rewritten and reviewed in earlier rounds and re-scanned here.
- INP is field data; Speed Insights collects it, lab TBT is 0 ms on all measured pages.
