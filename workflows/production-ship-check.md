# Workflow: Production Ship Gate

Run this checklist right before deploying or merging a feature branch.

1. **Static & Build Checks:**
   - Typecheck (`npx tsc --noEmit` or language equivalent) passes with zero errors.
   - Production bundle builds cleanly (`npm run build`).

2. **Backend & Security Checks (`05` + `06`):**
   - Every external input is schema-validated on the server.
   - Authn + resource-level authz enforced on every mutation and private read.
   - No hardcoded secrets, stack traces in HTTP responses, or unbounded list queries.
   - Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` / CSP) verified on deployed responses.

3. **Frontend & Responsive Checks (`03`):**
   - Zero console errors or uncaught exceptions during key user journeys.
   - Zero sideways scroll at `320px`, `375px`, `768px`, `1024px`, `1440px`.
   - Keyboard navigation (`Tab`, `Enter`, `Escape`) and `:focus-visible` rings work end-to-end.
   - `prefers-reduced-motion: reduce` disables non-essential motion cleanly.
