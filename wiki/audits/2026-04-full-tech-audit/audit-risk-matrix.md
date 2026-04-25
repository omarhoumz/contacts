# Full Stack Tech Audit Risk Matrix

Scoring model:

- Likelihood: 1 (rare) to 5 (frequent)
- Impact: 1 (limited) to 5 (severe)
- Score = Likelihood x Impact

## Top Risks (Post-remediation snapshot 2026-04-25)


| Risk ID | Description                                            | Likelihood | Impact | Score | Severity | Owner (proposed)  | Status |
| ------- | ------------------------------------------------------ | ---------- | ------ | ----- | -------- | ----------------- | ------ |
| R-01    | Regressions merge because CI omits tests               | 2          | 4      | 8     | Medium   | Platform/CI       | Mitigated (CI now runs tests) |
| R-02    | Cross-platform domain drift from duplicated hooks      | 4          | 4      | 16    | Critical | App Architecture  | Reduced (shared helper extraction started) |
| R-03    | Silent partial writes on contact child rows            | 2          | 4      | 8     | Medium   | Data/API          | Mitigated (explicit write error handling added) |
| R-04    | Oversized app-state hooks causing hidden coupling      | 3          | 4      | 12    | High     | Frontend Leads    | Reduced (auth/theme/session decomposition slices) |
| R-05    | Weak hook lint enforcement misses effect anti-patterns | 2          | 3      | 6     | Low-Med  | DX/Tooling        | Mitigated (react-hooks lint rules enabled) |
| R-06    | Backend typecheck placeholder weakens gate confidence  | 2          | 3      | 6     | Low-Med  | Backend           | Mitigated (backend config gate added) |
| R-07    | `SECURITY DEFINER` in public schema                    | 2          | 4      | 8     | Medium   | Backend/Security  | Reduced (private-schema trigger migration added) |
| R-08    | Node version mismatch between CI and deploy            | 1          | 3      | 3     | Low      | Platform          | Mitigated (Node 20 policy aligned) |
| R-09    | Migration check brittle to file growth                 | 2          | 2      | 4     | Low      | Platform/Backend  | Mitigated (structural migration check) |
| R-10    | Security headers incomplete                            | 1          | 3      | 3     | Low      | Platform/Security | Mitigated (CSP + HSTS headers added) |


## Heatmap Summary (current)

- **Critical zone (>= 16):** R-02
- **High zone (12-15):** R-04
- **Medium zone (8-11):** R-01, R-03, R-07
- **Low-Medium (< 8):** R-05, R-06, R-08, R-09, R-10

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