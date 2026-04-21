# Architecture

## System Overview
WidadOS is a Turbo monorepo with one shared domain model across web and mobile, backed by Supabase with RLS-first data access.

## Monorepo Layout
- `apps/web`: Vite + React application
- `apps/mobile`: Expo React Native application
- `apps/backend`: Supabase migrations, RLS policies, seed scripts, optional edge functions
- `apps/ui-lib-docs`: component and token documentation
- `packages/ui-lib`: web components
- `packages/ui-lib-mobile`: mobile components
- `packages/shared`: zod schemas, types, domain utilities
- `packages/*-config`: shared toolchain configs

## Data Flow
1. User authenticates with Supabase Auth.
2. Client reads/writes through Supabase SDK.
3. Postgres enforces RLS per `user_id`.
4. Shared schemas validate payloads before writes.

## Contact Domain (Phase 1)
- `contacts`
- `contact_emails`
- `contact_phones`
- `contact_addresses`
- `labels`
- `contact_labels`

## Cross-Platform Sharing Strategy
- Share: domain types, validation, adapters, formatting helpers, design tokens.
- Split: platform UI primitives and navigation.
