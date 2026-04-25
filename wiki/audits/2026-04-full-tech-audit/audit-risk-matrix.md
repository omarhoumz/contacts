# Full Stack Tech Audit Risk Matrix

Scoring model:
- Likelihood: 1 (rare) to 5 (frequent)
- Impact: 1 (limited) to 5 (severe)
- Score = Likelihood x Impact

## Top Risks

| Risk ID | Description | Likelihood | Impact | Score | Severity | Owner (proposed) |
|---|---|---:|---:|---:|---|---|
| R-01 | Regressions merge because CI omits tests | 4 | 5 | 20 | Critical | Platform/CI |
| R-02 | Cross-platform domain drift from duplicated hooks | 5 | 4 | 20 | Critical | App Architecture |
| R-03 | Silent partial writes on contact child rows | 3 | 5 | 15 | High | Data/API |
| R-04 | Oversized app-state hooks causing hidden coupling | 4 | 4 | 16 | High | Frontend Leads |
| R-05 | Weak hook lint enforcement misses effect anti-patterns | 4 | 3 | 12 | Medium | DX/Tooling |
| R-06 | Backend typecheck placeholder weakens gate confidence | 3 | 3 | 9 | Medium | Backend |
| R-07 | `SECURITY DEFINER` in public schema | 2 | 4 | 8 | Medium | Backend/Security |
| R-08 | Node version mismatch between CI and deploy | 3 | 3 | 9 | Medium | Platform |
| R-09 | Migration check brittle to file growth | 3 | 2 | 6 | Low-Med | Platform/Backend |
| R-10 | Security headers incomplete | 2 | 3 | 6 | Low-Med | Platform/Security |

## Heatmap Summary

- **Critical zone (>= 16):** R-01, R-02, R-04
- **High zone (12-15):** R-03, R-05
- **Medium zone (8-11):** R-06, R-07, R-08
- **Low-Medium (< 8):** R-09, R-10

## Risk Treatment Strategy

- **Immediate containment (0-30d):**
  - Add CI test gate.
  - Remove placeholder tests for core packages or mark as explicit fails.
  - Patch silent write integrity gaps.
- **Stabilization (30-90d):**
  - Decompose app-state hooks.
  - Extract shared cross-platform contact/label domain logic.
  - Enforce hooks lint policy and state ownership guidance.
- **Strategic hardening (90d+):**
  - Move privileged DB functions out of public schema.
  - Expand e2e/integration coverage and release health scoring.
