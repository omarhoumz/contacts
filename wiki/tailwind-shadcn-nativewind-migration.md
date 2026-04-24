# Tailwind + shadcn + NativeWind Migration Process

This runbook controls `R15` execution and verification.

## Objectives

- Remove all inline `style` usage from runtime UI code.
- Remove `apps/web/src/ui-styles.ts` and all equivalent inline-style map dependencies.
- Migrate web UI to Tailwind utility classes + shadcn-style primitives.
- Migrate all mobile app screens/components to NativeWind class-based styling.

## Phase Checklist

## Phase 0 — Foundations

- Add dependencies and config for:
  - web Tailwind + PostCSS
  - shadcn utility stack (`cva`, `clsx`, `tailwind-merge`, Radix slot/dialog, lucide icons)
  - mobile NativeWind + Tailwind config + Babel/Metro integration
- Add shared utility helpers and base UI primitives.

## Phase 1 — Web Core

- Integrate Tailwind in web entrypoints (`index.css`, config).
- Add semantic theme tokens (`:root` + `.dark`) in CSS.
- Replace `applyTheme()` variable mutation flow with class toggle (`document.documentElement.classList.toggle("dark", ...)`).

## Phase 2 — Web Shell/Nav

- Migrate `app-shell`, `sidebar-nav`, and `bottom-nav` to class-based styling.
- Preserve behavior:
  - sidebar collapse persistence
  - active route highlighting
  - mobile bottom nav behavior
  - theme toggle behavior

## Phase 3 — Web Route/Component Surfaces

- Migrate:
  - root auth route
  - contacts route + list section
  - trash route
  - manage labels route
  - auth/labels sections
- Keep CRUD/search/trash/labels behavior unchanged.

## Phase 4 — Mobile NativeWind

- Configure NativeWind in `apps/mobile` (`babel.config.js`, `metro.config.js`, `tailwind.config.cjs`, `global.css`, type declarations).
- Migrate all screens/components under `apps/mobile`:
  - `app-view.tsx`
  - `auth-section.tsx`
  - `contacts-section.tsx`

## Phase 5 — Shared + Docs + Cleanup

- Update shared UI package primitives to class-based styling.
- Update UI docs/stories to class-based examples.
- Remove dead style files and stale docs references.
- Update roadmap evidence and close `R15`.

## Verification Matrix

For every phase:

- `pnpm --filter @widados/web lint`
- `pnpm --filter @widados/web typecheck`
- `pnpm --filter @widados/web test`
- `pnpm --filter @widados/mobile lint`
- `pnpm --filter @widados/mobile typecheck`

Manual QA after major UI phases:

- Web:
  - light + dark mode
  - 1280x800 desktop
  - 768x1024 tablet
  - 375x812 mobile (real device if automation viewport mismatch persists)
- Mobile:
  - auth sign in/sign out
  - contacts create/edit/delete/restore
  - labels create/assign/delete
  - trash flows

## Rollback Rules

- Keep phase commits scoped and reviewable.
- If a phase introduces regressions, revert only the latest phase commit(s), not earlier stable phases.
- Do not remove compatibility paths until replacement behavior is verified.
- Record blockers in `wiki/roadmap.md` with explicit unblock criteria.

## R15 Done Gate

`R15` can be set to `DONE` only when all are true:

- No `style={{...}}` usage in runtime app code (`apps/web/src`, `apps/mobile`).
- No `ui-styles.ts` dependency and file removed from active runtime styling path.
- Web shell/routes use Tailwind + shadcn-style primitives with parity.
- Mobile screens/components use NativeWind with parity.
- Docs (`wiki/coding-style.md`, `wiki/operations.md`, roadmap verification log) reflect new styling system.
