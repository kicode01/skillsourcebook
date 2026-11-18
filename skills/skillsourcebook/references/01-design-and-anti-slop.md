# Design & Anti-AI-Slop Craft

Use this guide whenever designing or building a UI surface (SaaS app, dashboard, tool, or marketing/landing page).

## 1. Choose the Surface Mode First

| Surface Mode | Examples | Craft Priority |
| :--- | :--- | :--- |
| **Operate** | Dashboards, admin panels, settings, editors, data tables | Scanability, dense alignment, whisper-quiet elevation, single accent, `<= 200ms` transitions |
| **Read** | Docs, guides, changelogs, long-form articles | Typography rhythm, `< 80ch` line measure, clear heading scale, zero visual noise |
| **Persuade** | Landing pages, pricing, product launches | Strong above-the-fold focal point, concrete product proof, conversion clarity, honest copy |
| **Experience** | Portfolios, showcases, interactive demos | Let the artifact lead from the first viewport; interface chrome recedes |

Never apply marketing decoration to an **Operate** tool, and never ship a generic SaaS template for a **Persuade** page.

## 2. Pre-Code Brief (Mandatory Before Writing UI)

Before creating components or styles, resolve these in concrete terms:

1. **Human & Task:** Who opens this view, and what is the **one** primary action they came to complete?
2. **Visual Hierarchy:** What is the single focal element, and how does it win (size, weight, contrast, whitespace)?
3. **Palette & Temperature:** Pick 1 dominant neutral surface family, 1 secondary surface, and **1 accent color** (~60/30/10 split). Semantic colors (success/warn/danger) are reserved strictly for status.
4. **Depth Strategy (Pick ONE):**
   - *Borders-only* (`rgba` hairlines, crisp technical tools)
   - *Tonal shifts* (subtle lightness steps between background, cards, and popovers)
   - *Layered shadows* (light mode lift: 1px translucent ring + 2 soft depths)
   - *Dark mode rule:* Depth shadows disappear on dark surfaces — collapse elevation to subtle lightness steps + `rgba(255,255,255,0.06–0.12)` rings.
5. **Typography Scale:** Choose an explicit ratio (`~1.2` for dense UI, `~1.25` for product UI, `~1.333` for expressive pages) and 4 text levels (`primary`, `secondary`, `tertiary`, `muted`).

## 3. Concrete Craft Rules

- **Use What Exists:** Native HTML (`<button>`, `<a>`, `<input>`, `<dialog>`, `<details>`) -> established accessible primitive (`Base UI`, `Radix`, `React Aria`, `Headless UI`) -> hand-roll only as last resort with full keyboard/ARIA contract. Never `<div onClick>`.
- **Semantic Tokens, Not Raw Literals:** Bind to semantic tokens (`--bg-canvas`, `--bg-surface`, `--text-primary`, `--border-subtle`), never copy-pasted hex or `bg-white border-gray-200` utility soup across files.
- **Hierarchy via Weight + Contrast + Space:** Separate groups with whitespace (`>= 2x` inner gap) before reaching for divider lines.
- **Typography Hygiene:**
  - `text-wrap: balance` on headings; `text-wrap: pretty` on body copy.
  - `font-variant-numeric: tabular-nums` on every metric, price, timer, or table column.
  - Tighten tracking slightly on large display headings; keep body line-height `~1.5` and measure `<= 75–80ch`.
  - Never modify letter-spacing on normal UI controls unless part of the type system.
- **Geometry & Optical Details:**
  - Concentric border radii: `outerRadius = innerRadius + padding`.
  - Inputs sit *inset* (slightly recessed fill or crisp outline), popovers sit *above* parent surface.
  - Sidebars share the canvas background with a subtle boundary rather than splitting the screen into mismatched color blocks.
  - Optical alignment: reduce padding by ~2px on the icon side of icon+text buttons; nudge asymmetric triangles visually.
- **Honest Copy:** Active verbs (`Save changes`, not `Submit`), plain language from the user's perspective, empty states with one clear next action, and error messages that explain how to recover.

## 4. Explicit Anti-Slop Ban List

Reject and remove these generic AI tells unless explicitly requested by a brief:

- Unrequested rainbow/purple gradients, radial background blobs, or glowing buttons/cards as primary affordances.
- Repetitive SaaS-card grids where every item has an identical rounded box, icon tile, and drop shadow.
- Tracked-out `ALL-CAPS` eyebrows above every section heading, `01 / 02 / 03` numbering on non-sequential content, or `→` appended to every button/link.
- Highlighting one random italic/accent word in every headline.
- Invented testimonials, fake user counts, placeholder lorem ipsum, or decorative sparklines with fake data.
- `h-screen` or `w-screen` viewport traps (`100dvh` and `100%` instead).
- Missing interactive/data states (`hover`, `focus-visible`, `active`, `disabled`, `loading`, `empty`, `error`).

## 5. The Removal Test (Before Shipping)

Mentally delete each border, badge, eyebrow, gradient, icon tile, or wrapper. If clarity, hierarchy, and state survive — keep it deleted.
