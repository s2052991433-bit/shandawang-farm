# Design QA

## Source and implementation

- Reference: `reference/selected-home.png` — 1487 × 1058
- Desktop implementation capture: `qa/desktop-home-1069x1024-final.png` — 1069 × 1024
- Mobile farm capture: `qa/mobile-farm.png` — 390 × 844
- Combined visual comparison: `qa/compare-final.png`

## Visual review

- Preserved the selected reference's ivory header, deep-green typography, full-width mountain panorama, left-aligned seasonal message, dual CTAs, and the functional seasonal strip below the hero.
- Tightened the hero-to-function transition so the current-season strip and the start of the commerce section are visible without an abrupt visual break.
- Kept spacing, borders, icon weight, image treatment, and typography restrained; no card-heavy marketplace styling, decorative gradients, placeholder assets, or fake icons remain.
- Desktop header, hero crop, CTA hierarchy, timeline, and product-section entry were checked against the source in one side-by-side comparison image.
- Mobile header, hero crop, copy legibility, CTA wrapping, navigation, and farm-view transition were checked at 390 × 844.

## Interaction review

- `看看当季` scrolls to the product section.
- `进入农场` performs the shared-panorama camera push, copy fade, and farm-title reveal; reverse navigation returns to the homepage.
- Search dialog opens, focuses the input, and closes.
- Shopping bag drawer opens and routes its CTA to seasonal products.
- Mobile navigation opens and closes.
- Product add-to-bag action produces an accessible live confirmation.
- Reduced-motion mode removes nonessential transition duration.

## Technical review

- Production build: passed.
- Sites packaging tests: 4 passed, 0 failed.
- Browser console errors: 0.
- Horizontal overflow at the desktop QA viewport: none (`scrollWidth = viewport width`).

## Iterations

1. Initial implementation kept the generated panorama and interaction model but made the hero too tall and visually darker than the selected source.
2. Final implementation restored the selected source's brighter palette and deep-green type, added the functional desktop search control, shortened the hero/season strip, and brought the seasonal commerce section into the opening rhythm.

passed
