# Backend, APIs & Database Engineering

Apply these rules whenever designing or implementing API endpoints, server actions, database schemas, authentication/authorization, or background workers.

## 1. Contract-First API Design

- **Explicit Contracts:** Define request/response schemas and TypeScript/Python types before implementation. Never return ad-hoc raw ORM objects containing internal columns (`passwordHash`, internal flags).
- **Uniform Error Envelope:** Pick one structured error format across the entire backend:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Clear, safe message for the caller",
      "details": {}
    }
  }
  ```
- **Exact HTTP Semantics:**
  - `400` malformed syntax · `401` unauthenticated · `403` authenticated but forbidden · `404` missing (or hidden unauthorized resource) · `409` duplicate/state conflict · `422` semantic validation failure · `429` rate-limited · `500` unexpected server failure (log full trace server-side; **never** expose stack traces, SQL errors, or internal paths to clients).
- **Backward Compatibility:** Once an endpoint/field is public, extend rather than breaking consumers (Hyrum's Law); add fields optionally and deprecate explicitly.

## 2. Boundary Validation & Auth Boundaries

- **Validate Every External Input:** Parse `body`, `query`, `params`, `headers`, and webhook payloads at the handler boundary using strict schemas (`zod`, `valibot`, `pydantic`). Reject unknown/untrusted fields when doing updates (never spread `req.body` into `.update()` or `.create()`).
- **Authentication vs. Authorization (Both Required):**
  - Verify session/JWT/API key signature and expiration cleanly on the server.
  - Enforce **resource-level authorization** (`where: { id, organizationId }` or explicit policy check) on every read, mutation, and delete — never trust client-supplied `userId` or `role` fields.
  - Deny by default; fail closed on missing config or verification errors.

## 3. Database & Query Discipline

- **Parameterized Queries Only:** Never concatenate user input into SQL, NoSQL filters, or shell commands.
- **Migrations & Constraints:** Enforce `NOT NULL`, `UNIQUE`, `CHECK`, and `FOREIGN KEY` constraints at the database layer, not only in app code. Keep migrations additive and reversible where possible.
- **Indexing:** Index foreign keys, unique lookup keys, and common `WHERE` / `ORDER BY` predicates. Watch for missing composite indexes on multi-tenant queries (`(tenant_id, created_at DESC)`).
- **Transactions & Race Conditions:**
  - Wrap multi-step invariants (balance updates, inventory, order creation) in ACID transactions (`BEGIN ... COMMIT`).
  - Use optimistic concurrency (`version` / `updated_at` check) or `SELECT ... FOR UPDATE` where concurrent updates can collide.
- **N+1 & Unbounded Reads:**
  - Never issue queries inside a loop — use joins, `IN (...)` batching, or DataLoaders.
  - Bound every list endpoint with `limit` (with a hard server max, e.g. `<= 100`) and cursor/keyset pagination for large tables.

## 4. Reliability, Concurrency & Background Jobs

- **Idempotency:** Support idempotency keys on non-idempotent mutations (payments, webhooks, job enqueues) and make delete/webhook handlers safely idempotent.
- **External Calls:** Set explicit connect/read timeouts (`AbortSignal.timeout(...)`) on every outbound HTTP/SDK call; retry only safe/idempotent operations with exponential backoff + jitter.
- **Async Offloading:** Move slow tasks (emails, exports, AI processing, webhooks) off request handlers into queues/background workers with retry limits and dead-letter handling.
- **Graceful Shutdown:** Handle `SIGTERM`/`SIGINT` by stopping new work and draining in-flight requests/DB pools cleanly.
