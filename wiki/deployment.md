# Deployment

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

## Service Responsibility Matrix
- Netlify: `apps/web`, `apps/ui-lib-docs`
- Supabase: auth, database, storage, backend policies/functions
- EAS: Android/iOS binaries for testing and release flows

## Rollout Notes
- Start with managed services to maximize speed
- Promote through staging before production
- Keep rollback steps documented per environment
