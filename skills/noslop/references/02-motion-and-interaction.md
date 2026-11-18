# Motion, Micro-Interactions & Performance

Motion must clarify spatial relationships, state changes, or direct manipulation — never decorate or slow down frequent tasks.

## 1. Frequency Gate (Should It Animate?)

| Interaction Frequency | Decision |
| :--- | :--- |
| **100+ times/day** (command palette, keyboard shortcuts, row selection, tab switch) | **No animation** or `<= 120ms` opacity/color only — keep it instant |
| **Tens of times/day** (tooltips after first hover, dropdowns, filter chips) | Fast, subtle (`125–200ms`), no travel |
| **Occasional** (modals, drawers, sheets, toasts, accordions) | Standard purposeful transition (`200–400ms`) |
| **Rare / First-run** (onboarding, empty-to-filled reveal, hero moment) | Can add 1 deliberate orchestrated sequence |

## 2. Easing & Timing Curves

Built-in CSS `ease` / `ease-out` are often too soft. Use tuned curves:

```css
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);     /* Entrances, feedback, exits */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1); /* On-screen sliding/morphing */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);  /* Sheets & drawers */
}
```

- **Never use `ease-in` for UI interactions.** Starting slow makes the interface feel laggy right when the user clicks.
- **App UI speed cap:** Stay under `200ms` for micro-feedback and under `300ms` for standard UI controls (modals/drawers/toasts `<= 400–500ms`).
- **Exits are faster and smaller than enters:** e.g., enter `200–250ms`, exit `150ms` with smaller travel (`-8px` to `-12px` rather than sliding the whole container height).

## 3. Tactile Component Mechanics

- **Press feedback:** Scale interactive buttons subtly on `:active` (`transform: scale(0.97)` over `120–160ms var(--ease-out)`), never on disabled buttons and never below `0.95`.
- **Never animate from `scale(0)`:** Start scale entrances from `0.94–0.96` + `opacity: 0`.
- **Origin-aware popovers:** Anchor menus/popovers to their trigger via `transform-origin` (e.g., Radix/Base UI `var(--transform-origin)`). Keep centered modals `transform-origin: center`.
- **Tooltips:** Delay the first tooltip hover (`~300–500ms`), then skip delay and skip entrance animation when gliding across sibling toolbar items.
- **Interruptibility:** Prefer CSS transitions or physics springs (`motion/react` `useSpring` / `{ type: "spring", duration: 0.4, bounce: 0.15 }`) over rigid keyframe animations for anything the user can cancel mid-flight.
- **Static fallback cue:** Never communicate state change through motion alone — always leave a persistent static cue (color, icon, text, border).

## 4. 60/120fps Compositor Discipline

- **Animate ONLY GPU-composited properties:** `transform` and `opacity`.
- **Never animate layout properties:** `width`, `height`, `top`, `left`, `right`, `bottom`, `margin`, `padding`, `font-size`.
- **Never write `transition: all`:** Name exact properties (`transition: transform 160ms var(--ease-out), opacity 160ms var(--ease-out)`).
- **Avoid layout thrashing:** Batch all DOM reads (`getBoundingClientRect()`, `offsetHeight`) before any DOM writes; use FLIP for layout-like transitions.
- **Scroll & off-screen loops:**
  - Never drive continuous animations from `window` `scroll` events or `scrollY` polling. Use CSS `animation-timeline: view()` / `scroll()` or `IntersectionObserver` to trigger/pause off-screen animations.
  - No unbounded `requestAnimationFrame` loops without a stop condition.
- **Blur & `will-change`:**
  - Avoid animating `blur()` or `backdrop-filter` across large surfaces; keep transient blur effects `<= 8px` and one-shot.
  - Apply `will-change` only temporarily during active animation, never permanently across many nodes.
- **Reduced motion (Mandatory):**
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
  (Or replace positional travel with a gentle `150ms` opacity cross-fade while keeping brief `:active` press scale if non-disorienting.)
