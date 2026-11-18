---
name: skillsourcebook
description: >-
  Unified full-stack production engineering skill combining anti-slop UI design,
  60fps motion craft, container-query responsiveness, WCAG accessibility,
  redesign auditing, backend API/DB architecture, security hardening, and real
  verification. Use when designing, redesigning, building, reviewing, or
  hardening frontend interfaces, animations, APIs, databases, or full-stack
  applications across any agent.
---

# SkillSourceBook — Full-Stack Engineering Router

One compact skill that enforces a senior design-and-backend engineering bar
without loading conflicting or irrelevant rules into context.

## 1. Classify the Task & Load References (Max 2–3)

Read **only** the reference file(s) matching the current work:

| Task / Intent | Load Reference(s) |
| :--- | :--- |
| New UI, dashboard, SaaS app, or landing page | [01-design-and-anti-slop.md](./references/01-design-and-anti-slop.md) |
| Animations, transitions, micro-interactions, or jank | [02-motion-and-interaction.md](./references/02-motion-and-interaction.md) |
| Responsive layout, mobile/touch, or WCAG accessibility | [03-responsive-and-a11y.md](./references/03-responsive-and-a11y.md) |
| Redesign, UI critique, visual audit, or `DESIGN.md` | [04-redesign-and-audit.md](./references/04-redesign-and-audit.md) |
| REST/RPC APIs, schemas, SQL/Postgres, auth, or workers | [05-backend-api-and-db.md](./references/05-backend-api-and-db.md) |
| Security, headers/CSP, tests, or ship verification | [06-security-testing-ops.md](./references/06-security-testing-ops.md) |

For full-stack features, start with `01` + `05`, then run `03` + `06` before shipping.

## 2. Explicit Conflict Resolution

When design modes conflict, apply the stricter rule for the surface:

- **App / Dashboard (`Operate`):** Favor whisper-quiet surface elevation, `<= 200ms` transitions, zero unrequested gradients, high scanability, and single-accent clarity.
- **Marketing / Editorial (`Persuade` / `Experience`):** Allow bold typography, deliberate hero pacing, and one orchestrated reveal — still ban template AI clichés (card spam, ALL-CAPS eyebrows on every heading, `→` on every CTA, purple glow gradients).
- **Existing Codebases:** Preserve established design tokens, primitives, and conventions unless explicitly asked for a full redesign. Never mix two primitive libraries on the same surface.

## 3. Non-Negotiable Engineering Floor

1. **Reuse before inventing:** Inspect existing components, design tokens, helpers, and database/API patterns first. Never `<div onClick>` when `<button>` works.
2. **Real states everywhere:** Interactive controls ship default, hover, focus-visible, active, and disabled states; data views ship loading, empty, and error recovery states.
3. **Validate at boundaries:** Parse and validate external inputs with strict schemas (`zod` / typed validators) on the server; return uniform structured error envelopes; enforce authn + authz on every handler.
4. **Compositor-only motion:** Animate `transform` and `opacity`; never animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`); respect `prefers-reduced-motion`.
5. **Verify for real:** Run typecheck/build/tests after edits and inspect rendered views at mobile (`320px`/`375px`) and desktop (`1024px`/`1440px`) when browser tooling is available. Never report unverified behavior as passing.

## 4. Niche Catalog & Workflow Fallback

For specialized domains outside the core references (e.g., Three.js, GSAP ScrollTrigger, SwiftUI, View Transitions, Playwright, or framework-specific MCP tools):

1. Search the `skillsourcebook` repo's `catalog/index.json` (or query the `ui-skills` MCP server via `list_skills` / `get_skill` if enabled).
2. Load **only 1** niche skill on demand so rules stay focused.
3. For repeatable multi-step flows, check the repo's `workflows/` directory (`new-feature.md`, `redesign-audit.md`, `production-ship-check.md`).
