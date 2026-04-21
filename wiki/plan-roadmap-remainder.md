# Plan: Rest of the Roadmap (Phase 1 Closeout → Phase 2)

This document turns [roadmap.md](./roadmap.md) and [progress.md](./progress.md) into an **ordered execution plan**. It assumes implementation through roadmap **delivery steps 1–6** is largely in the repo; remaining work is **verification**, **hosted backend**, **release wiring**, and **proof of security**.

---

## 1. Goals (what “done” means)

Align with roadmap **success criteria**:

| Criterion | Plan outcome |
|-----------|----------------|
| Clean clone installs and builds | Documented green run: `pnpm install` → `pnpm lint` → `pnpm typecheck` → `pnpm build`; same on CI. |
| RLS verified against cross-user access | Two test users; documented checks on `contacts` and nested tables. |
| Android APK and iOS test app generated | EAS preview/internal build produced at least once; artifacts or build links noted. |
| Shared contracts used by web and mobile | Already true for core flows; extend only if new fields/APIs are added during closeout. |

Phase 1 **product** goals from the roadmap (auth, CRUD, search/labels, soft delete, web + mobile) should **smoke cleanly** against a **real** Supabase project before declaring Phase 1 complete.

---

## 2. Guiding principles

1. **Evidence before claims** — Log commands, dates, and results in [progress.md](./progress.md) (or a short “Verification log” subsection) when gates pass.
2. **Fix CI before polish** — A failing pipeline blocks trust; treat CI green as the first hard gate after local green.
3. **Backend before clients in production** — Migrations and RLS verified on the same project the apps will use (staging first if available).
4. **Smallest shippable slice** — Netlify + one EAS Android internal build may be enough to satisfy “test builds” before iOS if credentials block iOS temporarily.

---

## 3. Workstream A — Workspace health (Gate 1)

**Objective:** Reproducible install and scripts on a clean clone.

**Steps (order matters):**

1. From repo root, run `pnpm install` (use [progress.md](./progress.md) hints if pnpm store permissions fail).
2. Fix any failures in **`pnpm lint`**, **`pnpm typecheck`**, **`pnpm build`** (including Storybook under `@widados/ui-lib-docs`).
3. Ensure **GitHub Actions** `.github/workflows/ci.yml` passes on a branch/PR (install, lint, typecheck, build, Storybook artifact check, migration file checks).
4. Update [progress.md](./progress.md): mark the “Immediate” verification block done and add a one-line **Verification log** (date + commit SHA + “lint/typecheck/build/CI green”).

**Exit criteria:** Local + CI green; progress doc updated.

---

## 4. Workstream B — Supabase apply & config (Gate 2)

**Objective:** Schema and policies match repo; apps point at the right project.

**Steps:**

1. Create or choose a Supabase project (staging recommended).
2. In `apps/backend`, run **`supabase link`** with the project ref; set **`supabase/config.toml`** `project_id` accordingly (avoid committing secrets; project ref is not secret but keep team conventions).
3. Apply migrations: **`supabase db push`** (remote) or **`pnpm db:reset`** (local Docker) for iterative testing.
4. Set app env vars:
   - **Web:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (document in `.env.example` if not already complete).
   - **Mobile:** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
5. Smoke: sign-in, create contact, labels, trash, restore, delete forever, search.

**Exit criteria:** Migrations applied; both apps work against that project; `config.toml` / env story documented in progress or deployment doc.

---

## 5. Workstream C — RLS verification (Gate 3)

**Objective:** Satisfy “RLS verified against cross-user access.”

**Steps:**

1. Create **User A** and **User B** (email/password).
2. As A, create a contact and note its `id` (or attempt access only via UI/API).
3. As B, using the anon client (or REST with B’s JWT), attempt:
   - read/update/delete A’s `contacts` row;
   - insert/update rows on `contact_emails` / `contact_phones` / `contact_addresses` / `contact_labels` pointing at A’s `contact_id` with B’s `user_id` (should fail).
4. Record results in [progress.md](./progress.md) or [security.md](./security.md) (short table: action → expected → observed).

**Exit criteria:** Documented evidence that cross-user access is denied for the tested paths; file follow-up issues if any gap appears.

---

## 6. Workstream D — Release checks (roadmap step 6 completion)

**Objective:** “Web local run + mobile test builds” and hosted alignment.

**Steps:**

1. **Web (Netlify):** Create site; set build command and publish directory per `apps/web/netlify.toml`; inject Supabase env vars; run one production deploy; smoke test.
2. **Storybook (optional host):** Deploy `storybook-static` to Netlify/Docs site or keep as CI-only artifact until needed.
3. **Mobile (EAS):** Configure EAS project; run **Android** internal/preview build first (lower friction); then **iOS** when Apple credentials/profiles are ready.
4. Install test build on a device; repeat smoke from Workstream B.

**Exit criteria:** At least one web URL and one mobile binary (Android minimum) exercised successfully; links or build numbers noted in progress.

---

## 7. Workstream E — Mobile hardening (recommended before broad mobile rollout)

**Objective:** Align with [progress.md](./progress.md) “SecureStore” note and production expectations.

**Steps:**

1. Wire **Supabase Auth** session persistence through **`expo-secure-store`** (custom storage adapter for `createClient`).
2. Optionally add **sign-up** on mobile for parity with web (same validation via `@widados/shared`).
3. Re-run smoke tests on cold app launch (session survives).

**Exit criteria:** Sessions survive app restart; optional parity items done or explicitly deferred with rationale in progress.

---

## 8. Workstream F — Phase 2 intake (only after Gates 1–3, ideally D)

**Objective:** Start [roadmap.md](./roadmap.md) Phase 2 without dragging Phase 1 risk forward.

**Suggested order for Phase 2 discovery:**

1. **Performance & indexing** — Measure slow queries (contact list at scale, label search); add indexes or RPC only with evidence.
2. **Import/export** — Define formats (vCard CSV), privacy review, MVP scope.
3. **Collaboration / tiers** — Product/legal positioning; separate technical spike from MVP.
4. **Ops** — Error reporting, backups, runbooks.

**Exit criteria:** A short Phase 2 scoping doc or tickets cut from this list; no Phase 2 coding until Phase 1 gates are explicitly checked off.

---

## 9. Suggested calendar (flexible)

| Week | Focus |
|------|--------|
| 1 | Workstream A (local + CI); start B if A is green |
| 1–2 | Workstream B + C (Supabase + RLS proof) |
| 2–3 | Workstream D (Netlify + EAS); E in parallel if mobile is priority |
| After gates | Workstream F planning; begin Phase 2 first slice |

Adjust for team size; RLS and Supabase can shrink to a single afternoon if the project already exists.

---

## 10. Single checklist (copy into an issue or PR)

- [ ] Gate 1: `pnpm install` / lint / typecheck / build locally
- [ ] Gate 1: CI green on `main` or PR
- [ ] Gate 2: `supabase link` + `db push` (or documented local reset)
- [ ] Gate 2: Web + mobile smoke on real project
- [ ] Gate 3: Two-user RLS checks documented
- [ ] Gate 4: Netlify deploy + env vars
- [ ] Gate 4: EAS Android (and iOS when ready) test build
- [ ] Gate 5 (recommended): SecureStore auth storage on mobile
- [ ] Progress/wiki updated with verification log
- [ ] Phase 2: first scoped ticket written

---

## References

- [Roadmap](./roadmap.md) — Phase 1 list, delivery sequence, success criteria, Phase 2 themes  
- [Progress](./progress.md) — what is implemented, known gaps, next steps  
- [Deployment](./deployment.md) — if present, align Netlify/EAS details there over time  
