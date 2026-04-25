# Deployment

Last verified: 2026-04-25  
Owner: Platform

## Locked Stack
- Web hosting: Netlify
- Backend: Supabase
- Mobile build/distribution: Expo EAS

## Environment Strategy
- `local`
- `staging`
- `production`

## CI Pipeline
1. Install dependencies
2. Lint + typecheck
3. Build web and mobile bundles
4. Validate Supabase migrations and RLS policies
5. Deploy target artifacts

## Netlify (web)

- Site connects to **this repository root** (not `apps/web` as the Netlify root directory).
- Build config lives in **`netlify.toml`** at the repo root: installs workspace deps, runs `pnpm --filter @widados/web build`, publishes `apps/web/dist`.
- Use the **global Netlify CLI** from the repo root (`pnpm netlify:link`, `pnpm netlify:sites:create`, `pnpm netlify:deploy`, … — see `wiki/operations.md`). **`pnpm netlify:deploy`** / **`pnpm netlify:deploy:prod`** pass **`--filter @widados/web`** (same as `netlify deploy --prod --build --filter @widados/web`). Set build-time Supabase vars with **`pnpm netlify:env:push`** (reads `apps/backend/supabase/.env.cloud`) or **`netlify env:set`** from **`apps/web`** (or the dashboard); verify with **`pnpm netlify:env:check`**. Optional **`pnpm smoke:netlify-home`** hits the default production URL for HTTP 200 + shell marker. `.netlify/` is gitignored.

## Service Responsibility Matrix
- Netlify: `apps/web` (deploy); `apps/ui-lib-docs` optional separate site if needed later
- Supabase: auth, database, storage, backend policies/functions
- EAS: Android/iOS binaries for testing and release flows

## Rollout Notes
- Start with managed services to maximize speed
- Promote through staging before production
- Keep rollback steps documented per environment
