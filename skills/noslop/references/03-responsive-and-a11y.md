# Responsive Layout & WCAG Accessibility

Ensure every view holds together from a `320px` narrow mobile screen up to wide desktops, under `200%` text zoom, keyboard navigation, and touch input.

## 1. Component-First Responsiveness

- **Container Queries over Viewport Breakpoints for Components:**
  - Put `@container` (or `container-type: inline-size`) on reusable card/panel/widget wrappers and adapt internal layout with `@sm:`, `@md:`, `@lg:` rather than `md:` / `lg:`.
  - Remember: an element cannot query its own `@container` — put `@container` on the parent and variants on children; ensure flex/absolute/inline containers have a definite width so `inline-size` containment doesn't collapse to `0`.
  - Reserve viewport breakpoints (`sm:`, `md:`, `lg:`) for **page-level shells** (overall grid, sidebar collapse, sticky bars, global type scale).
- **Content-Driven Breakpoints:** Collapse layouts when content breaks or wraps awkwardly, not at arbitrary device dimensions.

## 2. Structural Layout Failure Prevention

| Pattern to Catch | Production Fix |
| :--- | :--- |
| `width: 100vw` causing horizontal scrollbar | Use `width: 100%` (or `max-w-full`) |
| `height: 100vh` clipped by mobile browser chrome | Use `min-height: 100dvh` / `h-dvh` |
| Flex/Grid child overflowing with long text or tables | Add `min-width: 0` on flex children and `minmax(0, 1fr)` on grid tracks |
| Fixed `height` on containers holding text | Use `min-height` (or `max-height` + `overflow-y: auto`) so `200%` text zoom never clips |
| Fixed headers/bottom bars colliding with notches or anchors | Include `viewport-fit=cover`, `env(safe-area-inset-*)`, and `scroll-padding-top` matching sticky header height |
| Physical `left`/`right` breaking RTL | Use logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `inset-inline-start`, `text-start`) |

## 3. Touch, Hover & Multi-Viewport QA Matrix

Verify rendered pages (via browser / DevTools emulation when available) across:

- **Widths:** `320×568`, `375×812`, `768×1024`, `1024×768`, `1440×900`, plus `±1px` around breakpoints.
- **Short landscape phone (`812×375`):** Modals, drawers, and dropdowns must scroll internally (`max-height: calc(100dvh - 2rem); overflow-y: auto`) so primary actions (`Save`, `Close`) remain reachable.
- **Touch targets:** Keep clickable controls at least `44×44px` on touch surfaces (extend small checkboxes/icons with padding or pseudo-elements, never overlapping adjacent hit areas).
- **No hover-only actions:** Controls revealed only on `:hover` (row delete/copy buttons, card actions) must remain visible or explicitly accessible under `@media (hover: none)`.
- **200% Text Zoom:** Check at `1024px` with root font size doubled — text must wrap cleanly without overlapping icons or clipping controls.

## 4. Non-Negotiable Accessibility (WCAG 2.2 AA)

1. **Accessible Names:**
   - Every `<button>`, `<a>`, and form control needs a clear accessible name.
   - Icon-only buttons **must** have `aria-label` (or `sr-only` label) and `aria-hidden="true"` on the decorative SVG.
   - Every `<input>`, `<select>`, and `<textarea>` must be paired with `<label for="...">` (or `aria-labelledby`).
2. **Keyboard & Focus:**
   - All interactive controls reachable via `Tab` in logical DOM order (never reorder visual flow inconsistently with `order` / `flex-row-reverse`).
   - Never remove focus outlines without replacing them with an equally visible `:focus-visible` ring (`>= 3:1` contrast).
   - Never use `tabindex > 0`.
3. **Dialogs, Menus & Overlays:**
   - Modals trap focus while open, set initial focus cleanly, close on `Escape`, and restore focus to the trigger on close.
   - Expandable triggers declare `aria-expanded` and `aria-controls`.
4. **Forms & Live Announcements:**
   - Link validation errors and helper text via `aria-describedby`; set `aria-invalid="true"` when invalid.
   - Announce dynamic async status/errors via `aria-live="polite"` (or `role="alert"` for critical errors) and `aria-busy` on loading regions.
   - Never block pasting in `<input>` or `<textarea>` fields.
   - Destructive/irreversible actions require confirmation (`AlertDialog`) or clear undo.
5. **Contrast & Semantics:**
   - `>= 4.5:1` contrast for normal text, `>= 3:1` for large text, icons, and input boundaries/focus rings.
   - Heading hierarchy (`h1` -> `h2` -> `h3`) without skipped levels; semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`).
