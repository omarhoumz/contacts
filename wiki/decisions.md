# Decisions (ADR)

This file tracks architecture and product decisions in a compact ADR format.

## ADR-001: Brand Name

- **Date:** 2026-04-21
- **Status:** Accepted
- **Decision:** Use `WidadOS` as the product brand.
- **Context:** Multiple culturally aligned names were evaluated for clarity and collision risk.
- **Consequences:** Marketing, app metadata, and docs should consistently use `WidadOS`.

## ADR-002: Monorepo Tooling

- **Date:** 2026-04-21
- **Status:** Accepted
- **Decision:** Use `pnpm` workspaces + `turbo`.
- **Context:** Need fast multi-app iteration and shared package workflows.
- **Consequences:** All apps/packages follow shared scripts and cache-aware pipelines.

## ADR-003: App Stack

- **Date:** 2026-04-21
- **Status:** Accepted
- **Decision:** Web uses `Vite + React`; mobile uses Expo React Native.
- **Context:** Fastest path to working web + Android/iOS test builds.
- **Consequences:** Platform UI primitives can diverge while domain logic stays shared.

## ADR-004: Backend Platform

- **Date:** 2026-04-21
- **Status:** Accepted
- **Decision:** Use Supabase for Auth + Postgres + RLS.
- **Context:** Security and delivery speed are top priorities for phase one.
- **Consequences:** Data model and policies must be RLS-first from initial migrations.

## ADR-005: Deployment Platform

- **Date:** 2026-04-21
- **Status:** Accepted
- **Decision:** Use Netlify + Supabase + Expo EAS.
- **Context:** Managed services reduce ops overhead and accelerate go-live.
- **Consequences:** VPS/self-hosting paths are out of scope for initial execution.

## ADR-006: Security Baseline

- **Date:** 2026-04-21
- **Status:** Accepted
- **Decision:** Enforce owner-based row access and shared schema validation.
- **Context:** Contacts data is private and sensitive by default.
- **Consequences:** All user-owned tables require `user_id` and strict policy tests.

## ADR-007: Open Source Strategy

- **Date:** 2026-04-21
- **Status:** Accepted
- **Decision:** Open-core model with hosted convenience monetization.
- **Context:** Goal is transparency and adoption while sustaining operating costs.
- **Consequences:** Keep self-host path documented and monetize managed operations.

## ADR-008: Pricing Direction

- **Date:** 2026-04-21
- **Status:** Accepted
- **Decision:** Hybrid pricing: one-time lite + low yearly tiers.
- **Context:** Cover costs with modest profit and low user friction.
- **Consequences:** Keep gross margin target around `20-35%`; revisit quarterly.

## ADR-009: Scope Discipline

- **Date:** 2026-04-21
- **Status:** Accepted
- **Decision:** Prioritize phase-one essentials only.
- **Context:** Fastest secure path to production requires tight scope.
- **Consequences:** Advanced sync and broad collaboration stay post-MVP.