# Supabase Backend

This directory contains schema migrations and RLS policies for WidadOS.

Apply migrations with Supabase CLI in this directory's parent app context.

## Database tests (pgTAP)

Cross-user RLS checks live in `supabase/tests/database/contacts_rls.test.sql`.

1. Start the local stack from `apps/backend`: `npx supabase start`
2. Run: `pnpm test:db` (or `npx supabase test db`)

CI runs the same flow on changes under `apps/backend/supabase/`.
