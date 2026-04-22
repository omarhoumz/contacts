# Operations Playbook

Common commands and runbooks for humans and agents working in this repo.

## Task Board Workflow

- Single source of truth: `wiki/roadmap.md`
- Pick highest priority `TODO` (or continue `IN_PROGRESS`)
- Set task status to `IN_PROGRESS` before doing work
- Execute + verify
- Commit with concise message
- Set task `DONE` with evidence in the table and `Verification Log`
- If blocked, set `BLOCKED` with explicit unblock condition
- If scope drifts, add a new row with priority and status

## Local Dev Commands

- Install: `pnpm install`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Build: `pnpm build`
- Web dev: `pnpm --filter @widados/web dev`
- Mobile dev: `pnpm --filter @widados/mobile dev`
- Storybook build: `pnpm --filter @widados/ui-lib-docs build`

If install has local cache permission issues:

- `PNPM_HOME="$PWD/.pnpm-home" pnpm install --store-dir "$PWD/.pnpm-store"`

## Supabase Operations

- Link project (from `apps/backend`):
  - `npx supabase@latest link --project-ref <project_ref>`
- Push migrations:
  - `npx supabase@latest db push`
- Local reset loop (if using Docker):
  - `pnpm db:reset`
- Generate types:
  - `pnpm db:types`

Current project ref used by roadmap tasks:

- `issiwryobnohfevlzyuu`

## Local Supabase (development)

Use a **local** stack for sign-up / sign-in without hosted email rate limits. Auth email is captured in **Mailpit** at `http://127.0.0.1:54324` when confirmations are on; with `enable_confirmations = false` in `apps/backend/supabase/config.toml`, new users can sign in immediately after sign-up (local only).

1. **Docker** running.
2. From `apps/backend`: `pnpm db:start` (or `npx supabase@latest start`). First run pulls images.
3. `pnpm db:status` — copy **Project URL** and **Publishable** key (or legacy anon JWT if your client expects JWT format; `supabase status -o env` lists all).
4. Put them in **`apps/web/.env.local`** and **`apps/mobile/.env.local`** as `VITE_SUPABASE_*` / `EXPO_PUBLIC_SUPABASE_*` (see root `.env.example`).
5. Apply schema locally: `pnpm db:reset` (resets DB + runs migrations + `seed.sql`) or rely on migrations from a clean start.
6. **Web**: `pnpm --filter @widados/web dev` — use Studio `http://127.0.0.1:54323` for tables/auth.
7. **Stop**: `pnpm db:stop` from `apps/backend`.

Database tests: `pnpm test:db` (requires stack running). See `apps/backend/supabase/README.md`.

**Do not** run `supabase config push` after editing local-only auth in `config.toml` unless you mean to change the **hosted** project’s Auth settings.

## Environment Variables

Canonical variable names (also in `.env.example`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Guidelines:

- Put real values only in local ignored env files (`.env.local`, `.env.*.local`)
- Never commit secrets
- Prefer publishable keys for new clients; keep legacy anon key only for compatibility

## GitHub / CI Operations

- Check latest runs:
  - `gh run list --limit 10`
- Show failed logs:
  - `gh run view <run_id> --log-failed`
- Push current branch:
  - `git push -u origin main` (first push) or `git push`

## Release Operations

- Netlify:
  - Ensure env vars are set in dashboard
  - Deploy and smoke web auth + one mutation
- EAS:
  - `eas login`
  - `eas build:configure`
  - Build Android first, then iOS when Apple setup is ready

## Agent Rules of Thumb

- Do not fabricate URLs, keys, run IDs, or test results
- Record evidence directly in `wiki/roadmap.md`
- Keep one active `IN_PROGRESS` task unless explicitly parallelized
- Prefer minimal diffs and update status immediately after completion
