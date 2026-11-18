# Workflow: Build a New Full-Stack Feature

Use this end-to-end sequence when shipping a new feature from scratch.

1. **Contract & Data Model First (`05-backend-api-and-db.md`):**
   - Define the database schema/migration with constraints and indexes.
   - Define the typed request/response schemas (`zod` / strict validator) and uniform error envelope.
   - Verify authentication and resource-level authorization rules before writing handlers.

2. **Surface & Visual Brief (`01-design-and-anti-slop.md`):**
   - Identify the surface mode (`Operate` vs `Persuade` vs `Read`) and the single primary action.
   - Reuse existing design tokens and accessible primitives (`Button`, `Dialog`, `Select`) instead of inventing raw styles.

3. **Implement UI With All States (`02-motion-and-interaction.md` + `03-responsive-and-a11y.md`):**
   - Build default, loading, empty, error-recovery, disabled, hover, and `:focus-visible` states.
   - Use `@container` queries inside reusable components; keep UI feedback `<= 200ms` using `transform`/`opacity` only.

4. **Verify (`06-security-testing-ops.md`):**
   - Write/run unit + integration tests covering validation (`422`), auth (`401`/`403`), and happy paths.
   - Run typecheck, build, and live browser inspection across `320px`, `375px`, `768px`, and `1440px`.
