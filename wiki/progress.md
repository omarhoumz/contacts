# Implementation Progress

## Snapshot

- **Branch:** `main`
- **Last updated:** 2026-04-21
- **Status:** Phase 1 [roadmap](./roadmap.md) through **step 5** is implemented in clients (labels, trash, search). **Step 6** in-repo work includes Storybook autodocs + an extra Card story, Turbo `storybook-static/`** outputs, `.gitignore` for local Storybook output, and a CI check that `storybook-static/index.html` exists after `pnpm build`. External release steps (Netlify/EAS project wiring, full green CI on your runner) still depend on environment setup.

## Completed Work

### 1) Monorepo and Shared Tooling

- Initialized workspace structure for `apps/`_ and `packages/`_.
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

- Added `packages/shared` with zod-backed contact schema and `labelCreateSchema` (name + hex color) for labels.
- Added `packages/ui-lib` web component primitives.
- Added `packages/ui-lib-mobile` React Native primitives.
- Package entry fields (`main` / `types` / `exports`) point at `src/index.tsx` so Vite resolves workspace packages correctly.

### 3) Web MVP (Vite, not Next.js)

- Implemented `apps/web` with Vite + React.
- Wired Supabase auth and contacts flow:
  - email/password sign-up + sign-in
  - contact create (includes `user_id` from session)
  - contact list refresh with nested `contact_labels` → `labels`
  - contact search on display name **and** assigned label names (client-side filter)
  - contact update
  - soft delete (`deleted_at`), **trash** view, **restore**, **permanent delete**
  - labels: create, list, toggle assignment on a contact
- Connected shared validation from `@widados/shared`.

### 4) Mobile MVP (Expo)

- Implemented `apps/mobile` Expo app shell and entrypoints.
- Wired Supabase auth and contacts flow:
  - sign-in
  - create contact (includes `user_id` from session)
  - search (name + labels), list refresh with label joins
  - update
  - soft delete, trash / restore / delete forever
  - labels: create, toggle on contacts
- Added `eas.json` for internal preview builds (APK/iOS internal flow).

### 5) Backend Secure Foundation (Supabase)

- Added migration in `apps/backend/supabase/migrations/20260421_initial_schema.sql`:
  - tables for profiles, contacts, contact_emails, contact_phones, contact_addresses, labels, contact_labels
  - RLS enabled for all user-owned tables
  - owner-based policies using `auth.uid() = user_id` / profile id
  - index for contact list query path
  - `updated_at` trigger function
  - auth user bootstrap trigger for profiles
- Follow-up migration `20260422_rls_contact_children_hardening.sql`:
  - RLS on `contact_emails`, `contact_phones`, `contact_addresses`, and `contact_labels` requires the parent `contacts` row (and `labels` for junction rows) to belong to the same `auth.uid()`, closing cross-user attachment if a contact UUID is guessed
  - unique index on `labels (user_id, name)` for idempotent seeding
  - `search_path = public` on `handle_new_user` and `set_updated_at` (security definer hardening)
- `seed.sql`: default “Friends” label per user via `on conflict (user_id, name) do nothing` (depends on the unique index above).
- `config.toml` placeholder for Supabase project linkage.
- `@widados/backend` scripts: `db:start`, `db:stop`, `db:reset`, `db:types` (Supabase CLI; run from `apps/backend` where `supabase/config.toml` lives).

### 6) UI Docs and CI/CD Path

- Converted `apps/ui-lib-docs` to Storybook (`@storybook/react-vite`).
- Declared Storybook addons in `apps/ui-lib-docs/package.json`: `@storybook/addon-essentials`, `@storybook/addon-interactions` (matches `.storybook/main.ts`).
- `Card` stories: **autodocs** tag, component description, **Default** and **Contact row example** (labels + actions layout); default preview layout **padded** for wider compositions.
- Turbo `build` task outputs include `**storybook-static/`**** so Storybook builds cache correctly; `storybook-static` is gitignored for local runs.
- CI workflow in `.github/workflows/ci.yml`:
  - install, lint, typecheck, build, **assert Storybook output** (`apps/ui-lib-docs/storybook-static/index.html`), migration presence checks for `20260421_initial_schema.sql` and `20260422_rls_contact_children_hardening.sql`
- Added Netlify web deploy config: `apps/web/netlify.toml`.

## Plan execution ([plan-roadmap-remainder](./plan-roadmap-remainder.md))

- **IN PROGRESS (2026-04-21):** **A3** — workspace `pnpm typecheck` green after **A1** `pnpm install` (link `typescript` / tool binaries in packages).

## Known Gaps / Constraints

- A full `pnpm install` → `pnpm lint` → `pnpm typecheck` → `pnpm build` green run has not been confirmed in CI or documented from a local machine yet (automated attempts hit sandbox cache/network limits or were interrupted).
- If `pnpm install` fails with cache permission errors, use a project-local store, for example:
  - `PNPM_HOME="$PWD/.pnpm-home" pnpm install --store-dir "$PWD/.pnpm-store"`
- Applying migrations to a linked Supabase project (`supabase link`, `supabase db push`) or a successful local `supabase db reset` is still pending documented verification (SQL is ready; CLI/Docker required locally).

## Next Steps (Execution Order)

### Immediate

1. Run dependency install locally (from repo root):

- `pnpm install`
- If needed: `PNPM_HOME="$PWD/.pnpm-home" pnpm install --store-dir "$PWD/.pnpm-store"`

1. Validate workspace:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- When all pass, mark this section done in this file (or move to a dated “Verification log” section).

### Backend

1. From `apps/backend`, link the Supabase project and push migrations:

- `supabase link --project-ref <project-ref>`
- `supabase db push`
- Or local Docker loop: `pnpm db:reset` (same directory; applies all migrations including `20260422`).

1. Verify RLS with two test users (aligns with roadmap success criteria):

- cross-user reads/writes denied on `contacts` and on nested rows (emails/phones/addresses/labels) for contacts not owned by the session.

### Web and Mobile

1. Web run and smoke test (labels + trash + search):

- `pnpm --filter @widados/web dev` (or `pnpm dev --filter=@widados/web` depending on pnpm version)

1. Mobile run and smoke test:

- `pnpm --filter @widados/mobile dev`

1. Add token persistence hardening for mobile (SecureStore adapter) if needed — `expo-secure-store` is already a dependency; wire Supabase auth storage when prioritized.

### Docs and Release Prep

1. Build Storybook:

- `pnpm --filter @widados/ui-lib-docs build`

1. Configure Netlify site and environment variables.
2. Configure EAS project and run preview build for Android/iOS.

## Definition of Done for Current Phase

- All workspace scripts run successfully on a clean clone.
- Supabase migration applied and RLS verified.
- Web and mobile MVP flows function end-to-end.
- Storybook builds and CI passes on pull requests.