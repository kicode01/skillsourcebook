# Redesign, UI Audit & Design System Extraction

Follow this workflow when asked to critique, deslop, redesign, or document an existing interface.

## 1. Pick the Right Scope Mode

| Request Type | Action |
| :--- | :--- |
| **Audit / Review only** | Inspect code + rendered views; report ranked findings; **do not** edit files unless asked |
| **Polish / Deslop** | Keep existing layout, brand, and tokens; fix broken states, hierarchy, spacing, contrast, and motion slop surgically |
| **Full Redesign** | Preserve product truth and core workflows, but replace the incumbent aesthetic/layout with an intentional new direction |
| **Uncertain Direction** | Build 2–3 genuinely divergent interactive variants behind a quick switcher on an isolated route before touching production files |

## 2. Extract / Respect `DESIGN.md` First

1. Check if the repository has `DESIGN.md`, theme tokens, CSS variables, or shared UI primitives.
2. If none exists on a multi-screen app, establish a compact `DESIGN.md` (palette roles, type scale, spacing grid, radii, depth strategy, component specs) from verified project decisions — never promote accidental one-off CSS into system rules.
3. Never create a second competing token system or primitive library.

## 3. Audit & Prioritization Ladder

Inspect in this order so foundational bugs aren't masked by cosmetic polish:

1. **Blockers & Accessibility (`HIGH`):** Missing accessible names, broken keyboard path, missing focus ring, trapped/unreachable actions on `320px` or `812×375`, clipped text at `200%` zoom, broken contrast, missing destructive confirmations, motion ignoring `prefers-reduced-motion`, color-only state.
2. **Missing Product States (`HIGH`/`MEDIUM`):** Absent loading, empty, error-recovery, disabled, or validation states.
3. **Layout & Responsive Drift (`MEDIUM`):** Horizontal overflow, inconsistent spacing scale, viewport queries inside reusable cards, hover-only touch actions.
4. **Visual & Motion Slop (`MEDIUM`/`LOW`):** Flat typography hierarchy, noisy borders, unmotivated gradients/glows, `transition: all`, `ease-in`, sluggish `> 300ms` UI controls, `scale(0)` entrances.

## 4. Cheaper-Fix Preference Order

When proposing or implementing fixes, pick the earliest option that resolves the root cause:

1. **Delete** — remove redundant borders, decorative eyebrows, noise animations, duplicate wrappers, or dead CSS.
2. **Use the platform** — replace custom `<div>` widgets with native `<button>`, `<dialog>`, `<details>`, native focus rings.
3. **Reuse existing tokens/components** — align one-off styles to the project's shared component or token.
4. **Correct the value** — fix spacing step, radius (`outer = inner + padding`), contrast pair, or easing curve.
5. **Add** — introduce a new token, wrapper, container query, or ARIA attribute only when the first 4 cannot solve it.

## 5. Reporting Format (Before / After)

For audits and redesign reviews, report one consolidated ranked table citing exact `path/to/file:line` evidence (never invent uninspected claims):

| Severity | Location | Before | After | Why |
| :--- | :--- | :--- | :--- | :--- |
| `HIGH` | `file:line` | Current implementation | Exact replacement | User impact in 1 short sentence |

Then verify every change in a live browser across mobile (`320px`/`375px`) and desktop (`1024px`/`1440px`) viewports and confirm build/typecheck pass.
