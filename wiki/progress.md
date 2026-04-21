# Implementation Progress

## Snapshot

- **Branch:** `main`
- **Last updated:** 2026-04-22
- **Status:** Core monorepo scaffolding and MVP foundations implemented in-repo; full `pnpm` install + script verification still pending a successful local run.

## Completed Work

### 1) Monorepo and Shared Tooling

- Initialized workspace structure for `apps/*` and `packages/*`.
- Added root workspace config:
  - `package.json` (turbo scripts)
  - `pnpm-workspace.yaml`
  - `turbo.json`
  - `.gitignore`
  - `.env.example`
- Added shared configuration packages:
  - `packages/ts-config`
  - `packages/eslint-config`
  - `packages/prettier-config`
  - `packages/tailwind-config`

### 2) Shared Domain and UI Libraries

- Added `packages/shared` with zod-backed contact schema.
- Added `packages/ui-lib` web component primitives.
- Added `packages/ui-lib-mobile` React Native primitives.

### 3) Web MVP (Vite, not Next.js)

- Implemented `apps/web` with Vite + React.
- Wired Supabase auth and contacts flow:
  - email/password sign-up + sign-in
  - contact create
  - contact list refresh
  - contact search
  - contact update
  - soft delete (via `deleted_at`)
- Connected shared validation from `@widados/shared`.

### 4) Mobile MVP (Expo)

- Implemented `apps/mobile` Expo app shell and entrypoints.
- Wired Supabase auth and contacts flow:
  - sign-in
  - create contact
  - search + list refresh
  - update
  - soft delete
- Added `eas.json` for internal preview builds (APK/iOS internal flow).

### 5) Backend Secure Foundation (Supabase)

- Added migration in `apps/backend/supabase/migrations/20260421_initial_schema.sql`:
  - tables for profiles, contacts, contact_emails, contact_phones, contact_addresses, labels, contact_labels
  - RLS enabled for all user-owned tables
  - owner-based policies using `auth.uid() = user_id` / profile id
  - index for contact list query path
  - `updated_at` trigger function
  - auth user bootstrap trigger for profiles
- Added `seed.sql` starter data pattern.
- Added `config.toml` placeholder for Supabase project linkage.

### 6) UI Docs and CI/CD Path

- Converted `apps/ui-lib-docs` to Storybook (`@storybook/react-vite`).
- Declared Storybook addons in `apps/ui-lib-docs/package.json`: `@storybook/addon-essentials`, `@storybook/addon-interactions` (matches `.storybook/main.ts`).
- Added basic `Card` story and Storybook config files.
- Added CI workflow in `.github/workflows/ci.yml`:
  - install, lint, typecheck, build, migration-file check
- Added Netlify web deploy config: `apps/web/netlify.toml`.

## Known Gaps / Constraints

- A full `**pnpm install` → `pnpm lint` → `pnpm typecheck` → `pnpm build`** green run has not been confirmed in CI or documented from a local machine yet (automated attempts hit sandbox cache/network limits or were interrupted).
- If `pnpm install` fails with cache permission errors, use a project-local store, for example:
  - `PNPM_HOME="$PWD/.pnpm-home" pnpm install --store-dir "$PWD/.pnpm-store"`
- No Supabase CLI migration run was executed yet (schema files are ready).

## Next Steps (Execution Order)

### Immediate

1. Run dependency install locally (from repo root):
  - `pnpm install`
  - If needed: `PNPM_HOME="$PWD/.pnpm-home" pnpm install --store-dir "$PWD/.pnpm-store"`
2. Validate workspace:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm build`
  - When all pass, mark this section done in this file (or move to a dated “Verification log” section).

### Backend

1. Link Supabase project and run migrations:
  - `supabase link --project-ref <project-ref>`
  - `supabase db push`
2. Verify RLS behavior with two test users:
  - confirm cross-user reads/writes are denied.

### Web and Mobile

1. Web run and smoke test:
  - `pnpm --filter @widados/web dev`
2. Mobile run and smoke test:
  - `pnpm --filter @widados/mobile dev`
3. Add token persistence hardening for mobile (SecureStore adapter) if needed.

### Docs and Release Prep

1. Build Storybook:
  - `pnpm --filter @widados/ui-lib-docs build`
2. Configure Netlify site and environment variables.
3. Configure EAS project and run preview build for Android/iOS.

## Definition of Done for Current Phase

- All workspace scripts run successfully on a clean clone.
- Supabase migration applied and RLS verified.
- Web and mobile MVP flows function end-to-end.
- Storybook builds and CI passes on pull requests.

