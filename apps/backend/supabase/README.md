# Supabase Backend

This directory contains schema migrations and RLS policies for WidadOS.

Apply migrations with Supabase CLI in this directory's parent app context.

## Local development stack

From this app directory (`apps/backend`):

1. `pnpm db:start` — Docker services (Postgres, GoTrue, Mailpit, Studio, …).
2. `pnpm db:status` — copy **Project URL** and **Publishable** key into `apps/web/.env.local` and `apps/mobile/.env.local` (`VITE_*` / `EXPO_PUBLIC_*`). See repo root `.env.example`.
3. `pnpm db:reset` — reapply migrations and `seed.sql` when schema changes.

`supabase/config.toml` sets `enable_confirmations = false` for **local** sign-up so you can sign in without opening Mailpit. Hosted Auth is unchanged unless someone runs `supabase config push` (avoid for local-only tweaks).

## Database tests (pgTAP)

Cross-user RLS checks live in `supabase/tests/database/contacts_rls.test.sql`.

1. Start the local stack from `apps/backend`: `pnpm db:start`
2. Run: `pnpm test:db` (or `npx supabase test db`)

CI runs the same flow on changes under `apps/backend/supabase/`.
