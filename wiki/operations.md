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

Use a **local** stack for sign-up / sign-in without hosted email rate limits. Auth email is captured in **Mailpit** at `http://127.0.0.1:54324` when confirmations are on. Default local auth behavior comes from merging `config.shared.toml` + `config.local.toml.example` (or optional gitignored `config.local.toml`) into generated `supabase/config.toml` — see `apps/backend/supabase/README.md`.

1. **Docker** running.
2. From `apps/backend`: `pnpm db:start` (runs `prepare:config` then `supabase start`). First run pulls images.
3. From **repo root**: `pnpm env:supabase:local` — writes `VITE_*` / `EXPO_PUBLIC_*` into `apps/web/.env.local` and `apps/mobile/.env.local` from `supabase status -o env` (requires the stack running).
4. Apply schema locally: from `apps/backend`, `pnpm db:reset` when you need a clean DB + `seed.sql`.
5. **Web**: `pnpm --filter @widados/web dev` — Studio `http://127.0.0.1:54323`.
6. **Stop**: from `apps/backend`, `pnpm db:stop`.

**Switch back to hosted Supabase:** copy `apps/backend/supabase/.env.cloud.example` to `.env.cloud`, fill `SUPABASE_URL` and `SUPABASE_ANON_KEY`, then from repo root run `pnpm env:supabase:cloud`.

Database tests: from `apps/backend`, `pnpm test:db` (requires stack running). B8 local API smoke: `pnpm smoke:local-b8` (Auth + PostgREST; same surface as web/mobile clients).

**Do not** run `supabase config push` after local-only auth tweaks unless you mean to change the **hosted** project’s Auth settings.

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

- **Netlify (web, D1–D4)** — requires **[Netlify CLI](https://docs.netlify.com/cli/get-started/)** installed globally (`netlify` on your `PATH`). Repo root scripts wrap the same commands (`pnpm netlify:*`).
  1. **D1 (create site + link this repo on disk)** — Authenticate, then create from repo root (writes gitignored **`.netlify/`**):
     - **Login:** `netlify login` (browser), **or** non-interactive/agent flow: `netlify login --request "D1 contacts" --json` → open the returned **`url`** in a browser → `netlify login --check <ticket_id>` (repeat `--check` until it succeeds). Alternatively set **`NETLIFY_AUTH_TOKEN`** (User settings → Applications → Personal access tokens) for the same session.
     - **New site:** `pnpm netlify:sites:create -- -n <unique-subdomain-name> --json` (passes through to `netlify sites:create`). Copy **`ssl_url`** / **`url`** from the JSON for `wiki/roadmap.md` D1 evidence. If the name is taken, pick another `-n`.
     - **Monorepo prompt:** if the CLI asks which project to use, pick **`@widados/web`** (`apps/web`). That writes **`apps/web/.netlify/state.json`**. For deploys driven by **repo root** `netlify.toml`, also create **`.netlify/state.json`** at the repo root with the same **`siteId`** (gitignored), then `netlify status` should show **Netlify TOML** as the root file.
     - **Existing site instead:** `pnpm netlify:link` and choose the site (no `sites:create`).
     - **Git continuous deploy:** after D1, in the Netlify UI link this Git repository to the site (build settings already match root **`netlify.toml`**; leave base directory empty).
  2. **D2** — Build/publish in root **`netlify.toml`** (`pnpm install --frozen-lockfile` + `pnpm --filter @widados/web build`, `apps/web/dist`). Preview: `pnpm netlify:deploy` (draft deploy + build). Production: `pnpm netlify:deploy:prod`.
  3. **D3** — From **repo root**, ensure `apps/backend/supabase/.env.cloud` exists with **`SUPABASE_URL`** and **`SUPABASE_ANON_KEY`** (same file as `pnpm env:supabase:cloud`). Then run **`pnpm netlify:env:push`** (sets `VITE_*` on Netlify for **production** + **deploy-preview**, **builds** scope; anon key with **`--secret`**). Confirm with **`pnpm netlify:env:list`**. **Note:** run Netlify env commands via these scripts or **`cd apps/web`** — the repo root triggers a monorepo picker for some `netlify` subcommands. Manual alternative: `cd apps/web` then `netlify env:set …`. Then redeploy (`pnpm netlify:deploy:prod` or UI).
  4. **D4** — `pnpm netlify:open` (or `netlify open:site`) after deploy; smoke sign-in + one contact.
- EAS:
  - `eas login`
  - `eas build:configure`
  - Build Android first, then iOS when Apple setup is ready

## Agent Rules of Thumb

- Do not fabricate URLs, keys, run IDs, or test results
- Record evidence directly in `wiki/roadmap.md`
- Keep one active `IN_PROGRESS` task unless explicitly parallelized
- Prefer minimal diffs and update status immediately after completion
