# Workflow: Redesign & Anti-Slop Audit

Use this workflow when upgrading an existing screen, component, or marketing page.

1. **Capture Baseline (`04-redesign-and-audit.md`):**
   - Inspect existing tokens, `DESIGN.md`, and shared components.
   - Render the current UI across desktop (`1440px`, `1024px`) and mobile (`375px`, `320px`) to establish ground truth.

2. **Audit in Priority Order:**
   - **Accessibility & Broken Flows (`HIGH`):** Missing labels, keyboard traps, missing focus rings, clipped actions at `812×375` or `200%` zoom, contrast failures.
   - **Missing States (`HIGH`/`MEDIUM`):** Absent empty, loading, error, or confirmation states.
   - **Layout & Responsive (`MEDIUM`):** Horizontal overflow, fixed heights on text containers, hover-only touch actions.
   - **Visual & Motion Slop (`MEDIUM`/`LOW`):** Flat hierarchy, unrequested gradients/glows, redundant card borders, `transition: all`, `ease-in`, sluggish `> 300ms` controls.

3. **Apply Cheaper-Fix Order:**
   - Delete clutter first -> use native HTML/platform -> reuse existing tokens/components -> fix exact values -> add only what's necessary.

4. **Re-Verify Rendered Output:**
   - Run typecheck + build and re-inspect every fixed breakpoint and state before finishing.
