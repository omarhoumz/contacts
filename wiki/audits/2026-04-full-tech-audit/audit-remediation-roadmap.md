# Full Stack Tech Audit Remediation Roadmap

## 0-30 Days (Containment)

1. **Enforce test gate in CI**
  - Update `.github/workflows/ci.yml` to run `pnpm test` (or targeted matrix).
  - Make the check required for merge.
  - Success metric: PR cannot merge with failing/absent tests.
2. **Replace placeholder quality gates on critical packages**
  - Prioritize `apps/mobile`, `apps/backend`, `packages/shared`.
  - Replace `echo "no tests yet"` with minimal meaningful suites.
  - Success metric: at least one real test suite per critical package.
3. **Fix silent partial write risk in contact upserts**
  - In web/mobile domains, check Supabase errors for every child mutation.
  - Add transactional write path (RPC) for parent+child consistency.
  - Success metric: no success toast on partial failure; deterministic rollback/error.
4. **Align runtime versions**
  - Standardize Node version across CI and Netlify.
  - Add `.nvmrc` or `engines` as source of truth.
  - Success metric: same Node major in local dev, CI, and deploy.

## 30-90 Days (Stabilization)

1. **State ownership refactor**
  - Decompose `use-web-app-state` and `use-mobile-app-state` into focused modules.
  - Move server-state ownership to query/cache + route-driven state where applicable.
  - Success metric: reduced hook surface area and fewer cross-domain side effects.
2. **Cross-platform domain extraction**
  - Extract shared contact/label domain logic into `packages/shared`.
  - Keep only platform adapters in web/mobile.
  - Success metric: single implementation for core domain operations.
3. **Effect integrity hardening**
  - Add `react-hooks` lint rules.
  - Create effect review checklist (subscription, cleanup, dependency policy).
  - Success metric: zero new exhaustive-deps violations and lower effect count in orchestrators.
4. **Migration and backend gate robustness**
  - Replace hardcoded migration file checks with structural checks.
  - Add real backend typecheck path.
  - Success metric: backend quality signals become meaningful and future-proof.

## 90+ Days (Strategic)

1. **Security model hardening**
  - Move privileged trigger functions out of `public` schema.
  - Validate execute grants and search_path controls.
  - Success metric: no privileged business logic callable from exposed schema.
2. **Quality maturity**
  - Add route/form/auth integration tests and smoke e2e checks.
  - Build release quality scorecard (test depth + lint/typecheck + smoke).
  - Success metric: measurable reduction in post-release regressions.
3. **Documentation governance**
  - Add "last verified" + owner metadata to core wiki docs.
  - Add periodic doc drift review in release checklist.
  - Success metric: docs freshness >90% for core runbooks and architecture docs.

## Ownership Proposal

- Platform/CI: CI gates, Node/version policy, migration checks.
- Frontend Architecture: state decomposition, effect policy, shared-domain extraction.
- Backend/Security: transactional writes, DB hardening, RLS and function privilege review.
- QA/PM: quality scorecard adoption and release gate policy.