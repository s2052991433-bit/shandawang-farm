# Prototype Instructions

For deployment, hosting, domain, and production-environment work, read `备忘.md` before acting and preserve its confirmed architecture decisions.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

## Confirmed design direction

- 2026-09-20: After receiving the coordinated revision and its stated weather/device limits, the user explicitly requested “发布”. This authorizes publishing that revision through the existing Cloudflare Workers Git integration. Preserve honest weather failure handling and the current D1 data; no additional design confirmation is needed for this release.

- 2026-09-19: User selected the “old persimmon tree / egg-gathering courtyard” image with “可以，就用它了”. The canonical new hero artwork is `public/assets/hero-courtyard-1672.webp` (responsive sibling: `hero-courtyard-960.webp`). Preserve the tree canopy, warm timber pavilion with oval window, three hens, inviting path, and mountain backdrop. Do not regenerate or replace the accepted composition without a new user request. `reference/selected-home.png` remains a reference for the surrounding brand UI, not the current hero artwork.
- This is AI-generated conceptual scenery, not verified photography of the actual farm. Use honest alt text and never describe it as live monitoring or farm footage.
- The user rejected the first imperceptible mist overlay and the gloomy bamboo/pond experiment. Both are retired. The user approved exploring season/weather-linked animation. Spring, summer and winter variants preserve the accepted autumn composition. The coordinated revision uses one Canvas2D renderer with local leaf/hen mesh motion, spatial rain/fog/snow, and generated rain/night lighting plates. Motion quality still awaits user review. Do not equate artwork approval with motion approval.
- Automatic seasons, solar terms, lunar dates and log dates follow Asia/Shanghai. Weather data must be labeled as a regional forecast, with a clear unavailable state on failure. Exact farm coordinates have not been supplied; the default location is explicitly Ningbo city, not the farm. Live provider access is unverified because preview requests timed out. Manual demo controls must never imply live conditions. Preserve pause, reduced-motion and offscreen suspension. Hen movement is a bounded local photographic deformation, not skeletal animation, walking, or video footage.
- The user authorized implementing the combined motion and coordination audit. Home introduces the farm and features the 2027 egg annual card before two concise food/journal entries. Shop holds the full catalog and initially shows current-season food; farm holds dated records. Use the courtyard as a shared visual anchor with compact shop/farm heroes. Keep ivory/forest-green typography, spacing and images consistent; use a separate closable weather dialog on mobile. Historical records retain their dates; sample records are visibly labeled and excluded from production. Annual and gift redemption have distinct entry copy, while actual voucher rights continue to come from the server.
- Keep image geometry intact. Desktop uses the full landscape behind a restrained ivory copy surface for contrast; mobile keeps the tree, pavilion and hens in view and places copy below the image. Primary navigation and redemption flows stay functional.

- Preserve the immersive full-width mountain-farm panorama and the calm, functional seasonal information structure.
- The home-to-farm transition must reuse the same panorama as a shared visual anchor: a subtle camera push, commerce-copy fade, and farm-title reveal, with a reduced-motion fallback.
- Keep the visual language restrained: warm ivory, deep forest green, authentic farm photography, generous spacing, minimal borders, and no gradients or card-heavy marketplace styling.
- Keep the primary action commercial (`看看当季`) and the secondary action immersive (`进入农场`).
- Content and page presentation should feel immersive: each route is a chapter in one continuous farm journey, using the shared panorama, documentary farm imagery, time-of-day cues, and restrained transitions.
- Preserve real multi-page hierarchy and URLs even when transitions feel seamless. Browsing may be cinematic; cart, address, payment, and confirmation must remain quiet and explicit.
- Customer registration by verified phone number is requested as of 2026-09-19; implementation is pending Tencent SMS qualification and integration. Existing customer redemptions must be preserved. The management backend must use individual administrator accounts with unique phone numbers, hashed passwords, secure server sessions, role-aware authorization, failed-login controls, and per-person audit records. Allow only the first owner to self-register with a one-time setup code; close self-registration afterward and require owner-issued invitations for future staff accounts. Never restore a shared password as the normal admin login.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
