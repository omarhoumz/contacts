# Supabase Backend

This directory contains schema migrations and RLS policies for WidadOS.

## Config layout (two-layer TOML)

Supabase CLI only reads **`supabase/config.toml`**, which is **generated and gitignored**. Do not edit it by hand.

| File | Tracked | Purpose |
| --- | --- | --- |
| `config.shared.toml` | yes | Shared settings (e.g. `project_id` for `supabase link` / `db push`). |
| `config.local.toml.example` | yes | Default local-only fragment (merged when `config.local.toml` is absent). |
| `config.local.toml` | no (gitignore) | Optional overrides; copy from the example and edit. |
| `config.toml` | no (gitignore) | Output of `pnpm prepare:config` (runs before `db:start`, `db:reset`, `db:status`, `test:db`). |

After **`supabase link`** updates `project_id` inside the generated `config.toml`, the next `pnpm prepare:config` keeps that `project_id` until you copy it into `config.shared.toml`. Other fields that `link` may write are not preserved in the merge (by design).

**Do not** run `supabase config push` unless you intend to change **hosted** Auth settings; the merged file includes local auth flags.

## App env: local vs cloud (repo root)

From the **repository root**:

- **`pnpm env:supabase:local`** — reads `npx supabase status -o env` from `apps/backend` and updates `VITE_*` / `EXPO_PUBLIC_*` in `apps/web/.env.local` and `apps/mobile/.env.local`. Requires a running local stack (`pnpm db:start` in `apps/backend`).
- **`pnpm env:supabase:cloud`** — copies `SUPABASE_URL` and `SUPABASE_ANON_KEY` from **`apps/backend/supabase/.env.cloud`** (gitignored) into the same app env files. Copy `supabase/.env.cloud.example` → `.env.cloud` and fill values from the Supabase dashboard.

## Local development stack

From `apps/backend`:

1. `pnpm db:start` — generates `config.toml`, then starts Docker (Postgres, GoTrue, Mailpit, Studio, …).
2. From repo root: `pnpm env:supabase:local` — point web/mobile at the local API + anon key.
3. `pnpm db:reset` — reapply migrations and `seed.sql` when schema changes.

## Database tests (pgTAP)

Cross-user RLS checks live in `supabase/tests/database/contacts_rls.test.sql`.

1. `pnpm db:start` from `apps/backend`
2. `pnpm test:db`

## B8 local smoke (Auth + REST)

From `apps/backend` with the stack running:

- `pnpm smoke:local-b8` — signup, password sign-in, contact + label + trash restore + permanent delete via PostgREST (same backend surface as web/mobile clients).

CI runs `pnpm prepare:config` before `supabase start`, then pgTAP, then this smoke (see `.github/workflows/db-tests.yml`) on changes under `apps/backend/supabase/` and `apps/backend/scripts/`.
