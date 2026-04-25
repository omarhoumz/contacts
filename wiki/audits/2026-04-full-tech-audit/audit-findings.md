# Full Stack Tech Audit Findings

Baseline:

- Date: 2026-04-25
- Branch: `main`
- Commit: `87baf89`
- Scope: web, mobile, backend, shared, CI/CD, docs/process

## Findings Register


| ID    | Severity | Area             | Finding                                                                        | Evidence                                                                                                                                                                                         | Impact                                                                            | Recommended Fix                                                                                     | Effort |
| ----- | -------- | ---------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------ |
| F-001 | High     | Testing/CI       | CI workflow does not run tests at all.                                         | `.github/workflows/ci.yml` runs lint/typecheck/build only.                                                                                                                                       | False-green merges; regressions can ship undetected.                              | Add `pnpm test` (or targeted turbo test matrix) to CI required checks.                              | S      |
| F-002 | High     | Testing          | Most package test scripts are placeholders (`echo "no tests yet"`).            | `apps/backend/package.json`, `apps/mobile/package.json`, `apps/ui-lib-docs/package.json`, `packages/shared/package.json`, `packages/ui-lib/package.json`, `packages/ui-lib-mobile/package.json`. | Current test pass signal has low product confidence.                              | Replace placeholders with real tests or explicit temporary skip policy tracked in roadmap.          | M      |
| F-003 | High     | Architecture     | Contact/label domain logic is duplicated across web and mobile in large hooks. | `apps/web/src/use-web-contacts-domain.ts` vs `apps/mobile/use-mobile-contacts-domain.ts`; similar duplication in labels/search files.                                                            | Drift and double-maintenance; fixes must be done twice and can diverge.           | Extract platform-agnostic contact/label domain layer into `packages/shared` with thin app adapters. | L      |
| F-004 | High     | Maintainability  | App state orchestrator hooks are oversized ("god hooks").                      | `apps/web/src/use-web-app-state.ts`, `apps/mobile/use-mobile-app-state.ts`.                                                                                                                      | Blurry ownership boundaries and broad re-render surfaces; harder refactors/tests. | Split into focused hooks (`auth`, `theme`, `feedback`, `contacts`, `labels`) and compose.           | M      |
| F-005 | Medium   | Reliability      | Child contact field upserts do not check mutation errors.                      | `upsertContactFields()` in web/mobile contacts domain hooks ignores Supabase error returns on delete/insert calls.                                                                               | Silent partial writes can mark success while child rows fail.                     | Check each mutation result; prefer transactional RPC for parent+child writes.                       | M      |
| F-006 | Medium   | Security         | `SECURITY DEFINER` trigger function exists in exposed `public` schema.         | `apps/backend/supabase/migrations/20260421_initial_schema.sql` (`public.handle_new_user`).                                                                                                       | Potential privilege escalation risk if function evolves or grants remain broad.   | Move function to private schema and explicitly revoke execute privileges.                           | M      |
| F-007 | Medium   | State/Effects    | Overuse of synchronization effects and broad dependencies in critical flows.   | `apps/web/src/routes/contacts.new.tsx` (`useEffect` depends on `s` object), multi-effect orchestration in `use-web-app-state.ts`.                                                                | Increased risk of accidental resets/stale behavior under future changes.          | Narrow effect deps; replace sync effects with derived state/router/query primitives.                | M      |
| F-008 | Medium   | Delivery         | Node runtime versions are inconsistent between CI and deploy.                  | `.github/workflows/ci.yml` uses Node 24; `netlify.toml` sets Node 20.                                                                                                                            | Environment-specific failures and harder reproducibility.                         | Standardize Node version and enforce via single source (engines/.nvmrc).                            | S      |
| F-009 | Medium   | CI Robustness    | Supabase migration check in CI is hardcoded to specific filenames.             | `.github/workflows/ci.yml` tests for exactly 2 migration files.                                                                                                                                  | Brittle and non-scalable migration validation.                                    | Replace with structural migration validation (naming/order/non-empty dir + db tests).               | S      |
| F-010 | Medium   | Quality Gates    | Lint config lacks React hooks rules and deeper architectural checks.           | `.eslintrc.cjs` excludes `react-hooks/exhaustive-deps` style enforcement.                                                                                                                        | Hook anti-patterns can pass lint and become runtime defects.                      | Add `eslint-plugin-react` and `eslint-plugin-react-hooks`; enforce exhaustive deps policy.          | S      |
| F-011 | Low      | Security Headers | Web headers are partial (no explicit CSP/HSTS policy in repo config).          | `netlify.toml` has XFO, XCTO, Referrer-Policy only.                                                                                                                                              | Reduced defense-in-depth for XSS/clickjacking hardening.                          | Add baseline CSP and verify HSTS at edge/CDN level.                                                 | M      |
| F-012 | Low      | Documentation    | Some operational/test numbers in docs drift from current reality.              | `wiki/operations.md` references historical test count; current web test file has 46 tests.                                                                                                       | Trust erosion in docs during incidents/onboarding.                                | Add "last verified" metadata and periodic doc validation checklist.                                 | S      |


## Strengths Observed

- RLS-first data model and dedicated DB tests exist:
  - `apps/backend/supabase/tests/database/contacts_rls.test.sql`
  - `.github/workflows/db-tests.yml`
- Monorepo tooling is coherent (`turbo`, `pnpm`, shared configs).
- Web lint/typecheck/build and unit tests currently pass on baseline commit.

## Quality Gate Trust Assessment

- Lint: **Medium**
  - Good baseline TS linting, but missing hooks-specific enforcement.
- Typecheck: **Medium**
  - Works for web/mobile/shared; backend typecheck is placeholder.
- Test: **Low**
  - Only one meaningful test suite in web; most packages are placeholders.
- CI overall: **Medium-Low**
  - Missing test gate on primary CI workflow.