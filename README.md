# WidadOS

Google Contacts-inspired product built as a Turbo monorepo for web and mobile, optimized for fast delivery, strong security defaults, and sustainable low-cost monetization.

## Final Direction
- **Brand:** `WidadOS`
- **Monorepo:** `pnpm` + `turbo`
- **Web:** `Vite + React` on Netlify
- **Mobile:** Expo React Native + EAS
- **Backend:** Supabase (Auth + Postgres + RLS)
- **Deployment stack:** Netlify + Supabase + EAS only
- **Business model:** open-core + hosted convenience
- **Pricing:** one-time + low yearly plans with `20-35%` margin target

## Documentation Hub
- Start here: [`wiki/README.md`](wiki/README.md)
- Architecture: [`wiki/architecture.md`](wiki/architecture.md)
- Product roadmap: [`wiki/roadmap.md`](wiki/roadmap.md)
- Security model: [`wiki/security.md`](wiki/security.md)
- Deployment and environments: [`wiki/deployment.md`](wiki/deployment.md)
- Pricing and monetization: [`wiki/pricing.md`](wiki/pricing.md)
- Naming decisions: [`wiki/naming.md`](wiki/naming.md)

## Monorepo Structure
- `apps/web` - web client
- `apps/mobile` - mobile app (Android/iOS)
- `apps/backend` - Supabase migrations, policies, seeds, edge functions
- `apps/ui-lib-docs` - UI documentation site
- `packages/ui-lib` - web UI components
- `packages/ui-lib-mobile` - mobile UI components
- `packages/shared` - shared types, schemas, and business utilities
- `packages/tailwind-config`
- `packages/ts-config`
- `packages/eslint-config`
- `packages/prettier-config`

## Phase 1 Scope
- Email/password auth
- Contacts CRUD (name, emails, phones, notes, labels, birthday, address, company/job title)
- Search and label support
- Soft delete (`Trash`) basics
- Security-first validation and access controls

## Security Baseline
- RLS on all user-owned tables
- Ownership checks via `auth.uid() = user_id`
- Shared schema validation with zod
- Secrets never committed; strict environment management
- CI checks for migrations, type safety, linting, and dependency hygiene

## Deployment Notes
- **Netlify:** hosts `apps/web` and `apps/ui-lib-docs`
- **Supabase:** hosts database/auth/storage/backend resources
- **EAS:** builds/distributes Android APK + iOS test builds

## MAU and Cost Targets (Rough)
| Phase | Timeline | MAU target | Estimated monthly cost |
| --- | --- | --- | --- |
| Phase 1 | Months 1-3 | `500-3,000` | `~$64-120` |
| Phase 2 | Months 4-6 | `3,000-15,000` | `~$90-220` |
| Phase 3 | Months 7-12 | `15,000-60,000` | `~$180-500` |
| Phase 4 | Year 2 early scale | `60,000-120,000` | `~$350-1,000+` |

## Open Source and Monetization
- Keep core code open and self-hostable
- Monetize hosted convenience (managed backups, easy onboarding, priority support)
- Pricing model:
  - **Lifetime Lite:** `$19-29` once
  - **Personal Yearly:** `$12-18/year`
  - **Family Yearly:** `$24-36/year`

## Naming Notes
- Final brand is **WidadOS**
- Backup names: `MidadOne`, `SuhbahHQ`
