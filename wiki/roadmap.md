# Roadmap and Task Board

This file is the single source of truth for roadmap, progress, and execution.

## Snapshot

- **Branch:** `main`
- **Last updated:** 2026-04-21
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


| ID  | Priority | Status      | Type             | Depends on | Task                                                                       | Done evidence                                                                       |
| --- | -------- | ----------- | ---------------- | ---------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| A1  | P0       | DONE        | command          | -          | Run `pnpm install` from repo root and stabilize install flow.              | `pnpm install` succeeds locally (latest run completed).                             |
| A2  | P0       | DONE        | code             | A1         | Replace placeholder lint scripts with real ESLint commands.                | Committed in `32c3320`.                                                             |
| A3  | P0       | DONE        | code+command     | A1         | Make `pnpm typecheck` green across workspace.                              | `pnpm typecheck` exits 0; committed in `dfd1f18`.                                   |
| A4  | P0       | DONE        | command+code     | A3         | Run `pnpm build`; fix Vite/Storybook/build script failures until green.    | `pnpm build` exits 0 locally on 2026-04-21 (Turbo build + Storybook static output). |
| A5  | P0       | IN_PROGRESS | command/external | A4         | Confirm `.github/workflows/ci.yml` passes on PR/branch.                    | Pending CI run URL/check summary.                                                   |
| A6  | P1       | TODO        | docs             | A5         | Add verification log (date + SHA + lint/typecheck/build/CI).               | Entry in this file under Verification Log.                                          |
| B1  | P1       | TODO        | external         | A6         | Create/choose Supabase project (staging recommended).                      | Project ref recorded (non-secret).                                                  |
| B2  | P1       | TODO        | command          | B1         | Run `supabase link --project-ref <ref>` in `apps/backend`.                 | CLI output confirms linked project.                                                 |
| B3  | P1       | TODO        | code/docs        | B2         | Align `apps/backend/supabase/config.toml` `project_id`.                    | File updated or documented exception.                                               |
| B4  | P1       | TODO        | command          | B3         | Apply schema (`supabase db push` or local `pnpm db:reset`).                | Migration apply output.                                                             |
| B5  | P1       | TODO        | external         | B4         | Capture anon URL + anon key from Supabase dashboard.                       | Values set in env locations.                                                        |
| B6  | P1       | TODO        | code/config      | B5         | Set `apps/web` Supabase env vars; verify names in `.env.example`.          | Web auth request succeeds.                                                          |
| B7  | P1       | TODO        | code/config      | B5         | Set mobile Supabase env vars.                                              | Mobile auth request succeeds.                                                       |
| B8  | P1       | TODO        | command/manual   | B6         | Web smoke: sign-in/up, create, label toggle, trash restore/delete, search. | Checklist with pass/fail notes.                                                     |
| B9  | P1       | TODO        | command/manual   | B7         | Mobile smoke matching B8.                                                  | Checklist with pass/fail notes.                                                     |
| C1  | P1       | TODO        | manual           | B8         | Create User A and one contact; capture contact id.                         | Contact id noted in verification.                                                   |
| C2  | P1       | TODO        | manual           | C1         | Create User B and confirm session.                                         | User B session verified.                                                            |
| C3  | P1       | TODO        | manual           | C2         | As B, attempt read of A's contact id (should fail/empty).                  | Result logged.                                                                      |
| C4  | P1       | TODO        | manual           | C2         | As B, attempt update/delete on A's contact (should fail).                  | Result logged.                                                                      |
| C5  | P1       | TODO        | manual           | C2         | As B, attempt nested insert using A's contact id (should fail).            | Result logged.                                                                      |
| C6  | P1       | TODO        | docs             | C3-C5      | Record RLS verification table (`action/expected/observed/notes`).          | Table in this file.                                                                 |
| D1  | P2       | TODO        | external         | B8         | Create Netlify site for web app.                                           | Netlify site URL.                                                                   |
| D2  | P2       | TODO        | config           | D1         | Set Netlify build/publish per `apps/web/netlify.toml`.                     | Successful deploy log.                                                              |
| D3  | P2       | TODO        | external         | D2,B5      | Add Supabase env vars in Netlify.                                          | Deploy uses env vars correctly.                                                     |
| D4  | P2       | TODO        | manual           | D3         | Smoke test production web URL (auth + one mutation).                       | Smoke checklist entry.                                                              |
| D5  | P2       | TODO        | external         | B9         | `eas login` + `eas build:configure` in `apps/mobile`.                      | EAS project configured.                                                             |
| D6  | P2       | TODO        | external         | D5         | Build Android internal/preview and install on device.                      | Build ID/artifact link.                                                             |
| D7  | P3       | TODO        | external         | D5         | Build iOS internal/simulator when Apple side ready.                        | Build ID/TestFlight link.                                                           |
| D8  | P2       | TODO        | docs             | D4,D6      | Log Netlify URL + EAS build IDs and release smoke results.                 | Entry in this file.                                                                 |
| E1  | P3       | TODO        | research         | D6         | Review Supabase + Expo secure storage approach.                            | Notes linked in task evidence.                                                      |
| E2  | P3       | TODO        | code             | E1         | Implement `expo-secure-store` auth storage adapter.                        | Cold restart keeps session.                                                         |
| E3  | P3       | TODO        | manual           | E2         | Verify session persistence after cold app restart.                         | Test note in verification log.                                                      |
| E4  | P3       | TODO        | code/docs        | E2         | Add mobile sign-up or explicitly defer with rationale.                     | Code change or defer note.                                                          |


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

## Notes and Constraints

- If `pnpm install` hits cache permission issues, use:
  - `PNPM_HOME="$PWD/.pnpm-home" pnpm install --store-dir "$PWD/.pnpm-store"`
- External tasks (Supabase/Netlify/EAS) require human credentials and dashboard access.
- Do not fabricate secrets, URLs, or build IDs; leave task as **BLOCKED** with what is needed.

