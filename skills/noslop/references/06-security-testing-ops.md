# Security, Testing & Ship Verification

Use this guide when hardening web/backend apps, writing tests, or preparing a build for production.

## 1. Security Hardening Checklist

- **Secrets & Config:**
  - Never hardcode API keys, signing secrets, or credentials in source, client bundles, or logs.
  - Validate required environment variables at startup; fail fast if critical signing/encryption secrets are missing.
  - Keep client-exposed env vars strictly limited to public values (`NEXT_PUBLIC_*` / `VITE_*`).
- **Transport & HTTP Headers:**
  - Enforce HTTPS/HSTS in production (`Strict-Transport-Security` only after verifying HTTPS across subdomains).
  - Set `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Frame-Options` / `frame-ancestors` in CSP.
  - Build a strict `Content-Security-Policy` (prefer nonces/hashes over `'unsafe-inline'`; disallow `object-src 'none'`).
- **XSS, CSRF & Cookies:**
  - Never pass unsanitized HTML into `dangerouslySetInnerHTML`, `innerHTML`, or template strings; sanitize rigorously with a battle-tested sanitizer if rich HTML is unavoidable.
  - Mark session cookies `HttpOnly`, `Secure`, and `SameSite=Lax` (or `Strict`). Protect state-changing cookie-authenticated endpoints against CSRF.
- **Abuse & DoS Guards:**
  - Rate-limit login, signup, password reset, AI endpoints, and expensive writes.
  - Cap request body sizes and upload MIME types/extensions/sizes; never serve user uploads inline on the app origin without isolation/content-disposition.
- **Dependencies:** Keep lockfiles committed; use SRI for static third-party scripts when applicable; fix high/critical vulnerabilities in production dependencies.

## 2. Testing Architecture (No Fake Passes)

- **Unit Tests:** Test pure domain rules, state transitions, validation edge cases, and error formatting deterministically without network/disk flakiness.
- **Integration & Contract Tests:**
  - Test API handlers end-to-end (validation failure `422`, unauthenticated `401`, cross-tenant forbidden `403`, conflict `409`, happy path `200/201`) against real schemas/emulators/test databases — never mock away the exact layer under test so a broken query still passes.
  - Clean up test state reliably between runs.
- **Browser / E2E Tests:** Verify critical user journeys (auth, form submit, error recovery, navigation, modal keyboard flow) in a real browser; assert zero uncaught page errors or unexpected `5xx`/`4xx` network responses.

## 3. Observability & Pre-Ship Gate

- **Structured Logging:** Emit structured JSON logs with `timestamp`, `level`, `requestId`, `route`, `durationMs`, and `status` — scrub passwords, tokens, cookies, and sensitive PII.
- **Clean Healthchecks:** Separate liveness (`/healthz`) from dependency readiness checks where applicable.
- **Mandatory Ship Verification (Before Claiming Done):**
  1. Run typecheck (`tsc --noEmit`), linter, and automated tests **after** the final edit.
  2. Run a full production build (`npm run build` / equivalent).
  3. Inspect rendered UI (desktop + mobile) and test critical API routes against real responses.
  4. Report only directly observed passing commands/counts — never extrapolate skipped, filtered, or mocked runs as full verification.
