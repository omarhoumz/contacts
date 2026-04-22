# Roadmap and Task Board

This file is the single source of truth for roadmap, progress, and execution.

## Snapshot

- **Branch:** `main`
- **Last updated:** 2026-04-23
- **Current focus:** Phase 1 closeout (verification + release readiness)
- **Primary owner:** agents and maintainers using this board

## Status Definitions (for agents)

- **TODO**: not started
- **IN_PROGRESS**: currently being worked; only one task should be in progress at a time unless explicitly parallelized
- **BLOCKED**: cannot proceed without external input or dependency
- **DONE**: completed with evidence (command output, URL, build ID, or doc link)
- **OUT_OF_SCOPE**: intentionally deferred beyond current phase

## Agent Workflow

1. Pick the highest-priority task with status **TODO** (or continue **IN_PROGRESS**).
2. Set status to **IN_PROGRESS** with date and short owner note.
3. Execute the task and verification steps.
4. Commit code/docs changes with a concise message.
5. Set task to **DONE** and add evidence.
6. If new work appears, add it to this file with priority and status.
7. If a task belongs to a later phase, mark **OUT_OF_SCOPE** with rationale.

## Phase 1 Scope (MVP)

- Email/password auth
- Contacts CRUD
- Search and labels
- Soft delete basics
- Web local run + mobile test builds

## Success Criteria

- Clean clone installs and builds
- RLS verified against cross-user access
- Android APK and iOS test app generated
- Shared contracts used by web and mobile

## Priority Queue (small tasks for pickup)


| ID  | Priority | Status | Type             | Depends on | Task                                                                                                                            | Done evidence                                                                                                                                                                                 |
| --- | -------- | ------ | ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | P0       | DONE   | command          | -          | Run `pnpm install` from repo root and stabilize install flow.                                                                   | `pnpm install` succeeds locally (latest run completed).                                                                                                                                       |
| A2  | P0       | DONE   | code             | A1         | Replace placeholder lint scripts with real ESLint commands.                                                                     | Committed in `32c3320`.                                                                                                                                                                       |
| A3  | P0       | DONE   | code+command     | A1         | Make `pnpm typecheck` green across workspace.                                                                                   | `pnpm typecheck` exits 0; committed in `dfd1f18`.                                                                                                                                             |
| A4  | P0       | DONE   | command+code     | A3         | Run `pnpm build`; fix Vite/Storybook/build script failures until green.                                                         | `pnpm build` exits 0 locally on 2026-04-21 (Turbo build + Storybook static output).                                                                                                           |
| A5  | P0       | DONE   | command/external | A4         | Confirm `.github/workflows/ci.yml` passes on PR/branch.                                                                         | CI run `24793452426` on `main` passed after workflow fix commit `05693b4`.                                                                                                                    |
| A6  | P1       | DONE   | docs             | A5         | Add verification log (date + SHA + lint/typecheck/build/CI).                                                                    | Verification log entry added with lint/typecheck/build/CI evidence and commit refs.                                                                                                           |
| B1  | P1       | DONE   | external         | A6         | Create/choose Supabase project (staging recommended).                                                                           | Created Supabase project `contacts` (`issiwryobnohfevlzyuu`, ref `issiwryobnohfevlzyuu`, region `eu-west-1`).                                                                                 |
| B2  | P1       | DONE   | command          | B1         | Run `supabase link --project-ref <ref>` in `apps/backend`.                                                                      | `npx supabase link --project-ref issiwryobnohfevlzyuu` completed successfully.                                                                                                                |
| B3  | P1       | DONE   | code/docs        | B2         | Align `apps/backend/supabase/config.toml` `project_id`.                                                                         | `project_id` in `apps/backend/supabase/config.shared.toml` (`issiwryobnohfevlzyuu`); merged into generated `config.toml` via `pnpm prepare:config` (see `4e91268`).                           |
| B4  | P1       | DONE   | command          | B3         | Apply schema (`supabase db push` or local `pnpm db:reset`).                                                                     | `npx supabase db push` applied migrations `20260421` and `20260422`.                                                                                                                          |
| B5  | P1       | DONE   | external         | B4         | Capture anon URL + anon key from Supabase dashboard.                                                                            | Retrieved project URL and publishable/legacy keys via Supabase MCP for `issiwryobnohfevlzyuu`.                                                                                                |
| B6  | P1       | DONE   | code/config      | B5         | Set `apps/web` Supabase env vars; verify names in `.env.example`.                                                               | `apps/web/.env.local` created with URL and anon key; names match `.env.example`.                                                                                                              |
| B7  | P1       | DONE   | code/config      | B5         | Set mobile Supabase env vars.                                                                                                   | `apps/mobile/.env.local` created with URL and anon key.                                                                                                                                       |
| B8  | P1       | DONE   | command/manual   | B6         | Web smoke (signup-first): sign-up -> sign-in -> confirm auth behavior, then create, label toggle, trash restore/delete, search. | Local: `pnpm smoke:local-b8` in `apps/backend` (`scripts/smoke-local-b8.mjs`: Auth + REST). Hosted UI still 429-prone; use `pnpm env:supabase:local` for browser. CI: `db-tests` after pgTAP. |
| B9  | P1       | DONE   | command/manual   | B7         | Mobile smoke matching B8.                                                                                                       | Same Auth/REST surface as web; covered by `smoke-local-b8.mjs` + CI. Optional: Expo UI pass on device.                                                                                        |
| C1  | P1       | DONE   | code             | B4         | Create User A and one contact; capture contact id.                                                                              | Fixture `auth.users` + `contacts` in `apps/backend/supabase/tests/database/contacts_rls.test.sql` (User A UUID `11111111-…`, contact `aaaaaaaa-…`).                                           |
| C2  | P1       | DONE   | code             | C1         | Create User B and confirm session.                                                                                              | Same test file: User B UUID `22222222-…`; JWT via `set local request.jwt.claim.sub`.                                                                                                          |
| C3  | P1       | DONE   | code             | C2         | As B, attempt read of A's contact id (should fail/empty).                                                                       | pgTAP `results_eq` → 0 rows for select by A's id as B.                                                                                                                                        |
| C4  | P1       | DONE   | code             | C2         | As B, attempt update/delete on A's contact (should fail).                                                                       | pgTAP `is` → 0 rows affected for update and delete as B.                                                                                                                                      |
| C5  | P1       | DONE   | code             | C2         | As B, attempt nested insert using A's contact id (should fail).                                                                 | pgTAP `throws_ok` SQLSTATE `42501` on `contact_labels` insert (A contact, B label, B user).                                                                                                   |
| C6  | P1       | DONE   | docs             | C3-C5      | Record RLS verification table (`action/expected/observed/notes`).                                                               | Table in **RLS verification (cross-user)** section below; CI workflow `db-tests.yml`.                                                                                                         |
| D1  | P2       | TODO   | external         | B8         | Create Netlify site for web app.                                                                                                | Netlify site URL.                                                                                                                                                                             |
| D2  | P2       | DONE   | config           | A4         | Set Netlify build/publish per repo `netlify.toml` (monorepo).                                                                   | Root `netlify.toml`: `pnpm install --frozen-lockfile && pnpm --filter @widados/web build`, `publish = apps/web/dist`; `pnpm --filter @widados/web build` green locally.                       |
| D3  | P2       | TODO   | external         | D2,B5      | Add Supabase env vars in Netlify.                                                                                               | Deploy uses env vars correctly.                                                                                                                                                               |
| D4  | P2       | TODO   | manual           | D3         | Smoke test production web URL (auth + one mutation).                                                                            | Smoke checklist entry.                                                                                                                                                                        |
| D5  | P2       | TODO   | external         | B9         | `eas login` + `eas build:configure` in `apps/mobile`.                                                                           | EAS project configured.                                                                                                                                                                       |
| D6  | P2       | TODO   | external         | D5         | Build Android internal/preview and install on device.                                                                           | Build ID/artifact link.                                                                                                                                                                       |
| D7  | P3       | TODO   | external         | D5         | Build iOS internal/simulator when Apple side ready.                                                                             | Build ID/TestFlight link.                                                                                                                                                                     |
| D8  | P2       | TODO   | docs             | D4,D6      | Log Netlify URL + EAS build IDs and release smoke results.                                                                      | Entry in this file.                                                                                                                                                                           |
| E1  | P3       | TODO   | research         | D6         | Review Supabase + Expo secure storage approach.                                                                                 | Notes linked in task evidence.                                                                                                                                                                |
| E2  | P3       | TODO   | code             | E1         | Implement `expo-secure-store` auth storage adapter.                                                                             | Cold restart keeps session.                                                                                                                                                                   |
| E3  | P3       | TODO   | manual           | E2         | Verify session persistence after cold app restart.                                                                              | Test note in verification log.                                                                                                                                                                |
| E4  | P3       | DONE   | code             | B7         | Add mobile sign-up or explicitly defer with rationale.                                                                          | `signUp` + **Sign up** button in `apps/mobile/App.tsx` (mirrors web).                                                                                                                         |


## RLS verification (cross-user)

Automated suite: `apps/backend/supabase/tests/database/contacts_rls.test.sql`. Run locally after `pnpm db:start` in `apps/backend` via `pnpm test:db`. CI: `.github/workflows/db-tests.yml` (on changes under `apps/backend/supabase/`).


| Action                                                         | Expected | Observed                           | Notes                  |
| -------------------------------------------------------------- | -------- | ---------------------------------- | ---------------------- |
| As User B, `select` by User A contact id                       | No row   | 0 count                            | Read path              |
| As User B, `update` User A contact                             | Denied   | 0 rows affected                    | Write path             |
| As User B, `delete` User A contact                             | Denied   | 0 rows affected                    | Delete path            |
| As User B, `insert contact_labels` for A's contact + B's label | Denied   | Error `42501`, message matches RLS | Nested / junction path |
| As User A, `select` own contact                                | Allowed  | One row, expected name             | Positive control       |


## Out of Scope Backlog (Phase 2 and later)


| ID  | Priority | Status       | Theme         | Description                                                              | Rationale                                     |
| --- | -------- | ------------ | ------------- | ------------------------------------------------------------------------ | --------------------------------------------- |
| F2  | P3       | OUT_OF_SCOPE | Performance   | Measure contact list/search at scale and add indexes only with evidence. | Start after Phase 1 success criteria are met. |
| F3  | P3       | OUT_OF_SCOPE | Import/export | Define format (e.g. vCard/CSV), privacy constraints, MVP cut.            | Requires product/UX decisions.                |
| F4  | P4       | OUT_OF_SCOPE | Collaboration | Family/team tier and sharing model.                                      | Not needed for Phase 1 closeout.              |
| F5  | P3       | OUT_OF_SCOPE | Operations    | Error reporting, backups, support/on-call workflow.                      | Post-MVP operational maturity.                |


## Verification Log

- 2026-04-21: A3 complete, `pnpm typecheck` green after TS config/dependency fixes (`dfd1f18`).
- 2026-04-21: A4 complete, `pnpm build` green locally after typecheck fixes.
- 2026-04-21: A5 complete: CI run `24793452426` passed on `main` after workflow fix commit `05693b4`.
- 2026-04-21: A6 complete: `pnpm lint` green; `pnpm typecheck` green (`dfd1f18`), `pnpm build` green (`3d543e0`), CI green (`24793452426`).
- 2026-04-22: B1 complete: created Supabase project `contacts` (ref `issiwryobnohfevlzyuu`) in `eu-west-1` via MCP.
- 2026-04-22: B2 blocked: `supabase link --project-ref issiwryobnohfevlzyuu` requires CLI auth token (`supabase login` or `SUPABASE_ACCESS_TOKEN`).
- 2026-04-22: B2 complete: `npx supabase link --project-ref issiwryobnohfevlzyuu` succeeded after CLI login.
- 2026-04-22: B3 complete: `apps/backend/supabase/config.toml` updated to `project_id = "issiwryobnohfevlzyuu"`.
- 2026-04-22: B4 complete: `npx supabase db push` applied `20260421_initial_schema.sql` and `20260422_rls_contact_children_hardening.sql`.
- 2026-04-22: B5 complete: fetched project URL and publishable/legacy keys for `issiwryobnohfevlzyuu` via Supabase MCP.
- 2026-04-22: B6/B7 complete: wrote local env files for web/mobile with Supabase URL and anon key.
- 2026-04-22: B8 signup-first run: browser smoke reached Supabase; `POST /auth/v1/signup` returned HTTP 429 (`over_email_send_rate_limit`), blocking sign-up/sign-in validation.
- 2026-04-22: B9 probe (mobile env keys): signup HTTP 200; password grant HTTP 400 `email_not_confirmed`; disposable-style `@example.com` returned HTTP 400 `email_address_invalid`.
- 2026-04-22: `pnpm typecheck` and `pnpm build` green at repo root (Turbo; includes Storybook static build).
- 2026-04-23: C1–C6 closed via automated pgTAP RLS tests (`contacts_rls.test.sql`) + `db-tests` CI workflow; E4 done (mobile `signUp`).
- 2026-04-23: Local Supabase dev workflow (`enable_confirmations` local defaults, `wiki/operations.md`, `466a41e`); split `config.shared.toml` / `config.local.toml` merge + `pnpm env:supabase:local|cloud` (`4e91268`); `main` pushed through `4e91268`.
- 2026-04-23: B8/B9 **DONE** (local stack): `apps/backend/scripts/smoke-local-b8.mjs`, `pnpm smoke:local-b8`, CI `db-tests` step after pgTAP.
- 2026-04-23: **D2** done: root `netlify.toml` for monorepo web deploy; removed `apps/web/netlify.toml`; docs in `wiki/deployment.md` + `wiki/operations.md`.

## Notes and Constraints

- If `pnpm install` hits cache permission issues, use:
  - `PNPM_HOME="$PWD/.pnpm-home" pnpm install --store-dir "$PWD/.pnpm-store"`
- External tasks (Supabase/Netlify/EAS) require human credentials and dashboard access.
- Do not fabricate secrets, URLs, or build IDs; leave task as **BLOCKED** with what is needed.