# Prototype Instructions

For deployment, hosting, domain, and production-environment work, read `备忘.md` before acting and preserve its confirmed architecture decisions.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

## Confirmed design direction

- Treat `reference/selected-home.png` as the visual source of truth for the V2 homepage.
- Preserve the immersive full-width mountain-farm panorama and the calm, functional seasonal information structure.
- The home-to-farm transition must reuse the same panorama as a shared visual anchor: a subtle camera push, commerce-copy fade, and farm-title reveal, with a reduced-motion fallback.
- Keep the visual language restrained: warm ivory, deep forest green, authentic farm photography, generous spacing, minimal borders, and no gradients or card-heavy marketplace styling.
- Keep the primary action commercial (`看看当季`) and the secondary action immersive (`进入农场`).
- Content and page presentation should feel immersive: each route is a chapter in one continuous farm journey, using the shared panorama, documentary farm imagery, time-of-day cues, and restrained transitions.
- Preserve real multi-page hierarchy and URLs even when transitions feel seamless. Browsing may be cinematic; cart, address, payment, and confirmation must remain quiet and explicit.
- Keep customer-facing pages free of account registration. The management backend must use individual administrator accounts with unique phone numbers, hashed passwords, secure server sessions, role-aware authorization, failed-login controls, and per-person audit records. Allow only the first owner to self-register with a one-time setup code; close self-registration afterward and require owner-issued invitations for future staff accounts. Never restore a shared password as the normal admin login.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
