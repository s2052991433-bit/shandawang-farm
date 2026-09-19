# Selected courtyard hero — design QA

final result: passed

Scope: integration of the user-selected still artwork and responsive hero copy, not acceptance of continuous animation or a full site audit.

## Evidence

- Source visual truth: public/assets/hero-courtyard-1672.webp; selected by the user on 2026-09-19 (“可以，就用它了”). Original generated image: /workspace/scratch/3248758a7d52/generated_images/exec-deef306e-945d-47b7-be03-db3485741d9b.png.
- Browser-rendered implementation: /workspace/scratch/3248758a7d52/courtyard-desktop.jpg.
- Browser-rendered responsive implementation: /workspace/scratch/3248758a7d52/courtyard-devices.jpg.
- Combined source/implementation comparison: /workspace/scratch/3248758a7d52/courtyard-comparison.jpg; opened and visually compared together.
- Desktop viewport: 1363 × 936 CSS px; screenshots returned at 1363 × 936, no density normalization needed. Source artwork: 1672 × 941. The source is a landscape asset, not a complete UI mock; desktop cover crop and the ivory copy surface are intentional integration choices.
- Responsive evidence: real iframe viewports 390 × 844 and 760 × 844, displayed together in a 1363 × 936 browser screenshot. This verifies CSS response in Chrome, not physical devices or Safari.
- State: home, images fully loaded, cart unchanged, no dialogs.

## Comparison history

1. P2: existing general hero heading rule overrode the new type size and left “么” on its own desktop line. Evidence: first live browser capture, computed font-size 81.78px. Fixed by increasing the selected hero stylesheet's selector specificity; no global typography changes.
2. Revised screenshot and combined comparison: title occupies two balanced lines, source tree/pavilion/hens remain visible. Responsive captures show the same selected scene and readable copy below it. No remaining P0/P1/P2 issues introduced by this change were identified.

## Required fidelity checks

- Typography: retained the existing Noto Serif SC heading and system body fonts. Scoped desktop size and mobile heading wrap checked in full-sized captures. Buttons and body text readable; no lone-character heading wraps in checked home views.
- Spacing/layout: desktop ivory surface remains left of the pavilion and chicken focal points. Mobile shows the tree, pavilion, path and hens above the copy; primary buttons fit without horizontal clipping. The responsive image crop is intentional.
- Colors/tokens: preserved warm ivory, forest green and original warm daylight. No recoloring or synthetic fog over the selected artwork. Text has an ivory backing for contrast.
- Image quality: the approved artwork is used directly, with only WebP encoding/resizing. No redrawing, geometry distortion or fabricated movement. 1672px and 960px variants preserve scene identity; visible detail checked against the source.
- Copy/content: existing headlines and CTA labels retained. Alt text describes a farm concept scene rather than falsely claiming documentary footage. Existing season/date content is not changed by this visual integration.
- Focused inspection: full-size desktop and device screenshots were also opened separately to inspect title wrap, copy readability, button fit and mobile focal crop beyond the combined thumbnail comparison.

## Interaction and console checks

- Desktop “进入农场” navigated to /farm and rendered “山里的一天，正在发生”.
- Desktop “看看当季” navigated to /shop and rendered the shop hero after waiting for route completion.
- Mobile iframe “进入农场” navigated to the farm page; the logo returned home.
- Console errors checked: only browser-extension metadata transmission errors from chrome-extension:// were recorded. No application-origin errors in the inspected log sample.
- npm run build passed after final CSS changes.

## Limits and follow-up

- This approval covers still imagery only. The user's requested continuous photorealistic motion remains outstanding; rejected mist and pond candidates were removed from the active implementation.
- Native iOS Safari, large-device matrix, live D1 and authenticated business flows were not retested for this visual-only change.
- Pre-existing hard-coded seasonal/date labels require a separate content correction; the image update does not validate their freshness.
- Formal production deployment has not been performed.
