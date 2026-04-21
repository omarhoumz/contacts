# Plan: Rest of the Roadmap (Phase 1 Closeout → Phase 2)

This document turns [roadmap.md](./roadmap.md) and [progress.md](./progress.md) into **small, trackable tasks**. Implementation through roadmap **delivery steps 1–6** is largely in the repo; remaining work is **verification**, **Supabase on a real project**, **RLS proof**, **release wiring**, and optional **mobile hardening**.

---

## Quick index (task IDs)


| Block | Theme                       | Task IDs                                    |
| ----- | --------------------------- | ------------------------------------------- |
| **A** | Workspace and CI            | [A1–A6](#block-a-workspace-and-ci-gate-1)   |
| **B** | Supabase and env            | [B1–B9](#block-b-supabase-and-env-gate-2)   |
| **C** | RLS verification            | [C1–C6](#block-c-rls-verification-gate-3)   |
| **D** | Release (Netlify / EAS)     | [D1–D8](#block-d-release-gate-4)            |
| **E** | Mobile hardening (optional) | [E1–E4](#block-e-mobile-hardening-optional) |
| **F** | Phase 2 intake              | [F1–F5](#block-f-phase-2-intake)            |


Complete tasks **in order within each block**; **A** before **B** is ideal so CI catches issues early.

---

## Goals (unchanged)


| Criterion                       | Done when                                                                |
| ------------------------------- | ------------------------------------------------------------------------ |
| Clean clone installs and builds | A1–A6 complete; result logged in [progress.md](./progress.md).           |
| RLS verified                    | C1–C6 complete; short table in progress or [security.md](./security.md). |
| Android / iOS test builds       | D5–D8 (Android first is fine).                                           |
| Shared contracts                | Already satisfied unless you add new APIs during closeout.               |


**Principles:** (1) Log evidence in progress when a gate passes. (2) Green CI before heavy release work. (3) Same Supabase project for migrations, RLS tests, and app envs. (4) Smallest slice: Netlify + one Android EAS build can satisfy “test builds” before iOS.

---

## Block A: Workspace and CI (Gate 1)

**Outcome:** Anyone can clone, install, and run scripts; CI matches.

- **A1** — Run `pnpm install` from repo root; capture any errors (use [progress.md](./progress.md) pnpm store hint if permissions fail).
- **A2** — Run `pnpm lint`; fix or replace `echo` placeholder scripts only where they block real linting (minimal change).
- **A3** — Run `pnpm typecheck`; fix missing deps or TS errors package-by-package.
- **A4** — Run `pnpm build`; fix Vite/Storybook/build script failures until green.
- **A5** — Open a PR (or push to a CI branch); confirm `.github/workflows/ci.yml` passes end-to-end.
- **A6** — In [progress.md](./progress.md), add a **Verification log** line: date, commit SHA, “lint / typecheck / build / CI green”.

---

## Block B: Supabase and env (Gate 2)

**Outcome:** Migrations applied; web and mobile point at the project; basic smoke works.

- **B1** — Create or choose a Supabase project (staging recommended); note project ref somewhere safe for the team.
- **B2** — Install Supabase CLI if needed; from `apps/backend`, run `supabase link --project-ref <ref>`.
- **B3** — Set `apps/backend/supabase/config.toml` `project_id` to match (follow team policy on committing ref).
- **B4** — Apply schema: `supabase db push` **or** for local-only iteration, `pnpm db:reset` with Docker; confirm no migration errors.
- **B5** — Copy **anon** URL and **anon** key from Supabase dashboard.
- **B6** — Web: create `apps/web/.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; confirm `.env.example` lists the same variable names.
- **B7** — Mobile: set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (e.g. app config or `.env` per Expo docs).
- **B8** — Web smoke: sign-in (and sign-up if testing new users), create contact, label toggle, trash → restore → delete forever, search.
- **B9** — Mobile smoke: repeat **B8** flows on device or simulator; one sentence in progress if anything differs from web.

---

## Block C: RLS verification (Gate 3)

**Outcome:** Documented proof that User B cannot touch User A’s data (for exercised paths).

- **C1** — Register **User A** (email/password); sign in; create one contact; copy contact `id` from network tab or Supabase table editor.
- **C2** — Register **User B**; sign in; confirm B’s session is active (different email).
- **C3** — As B, attempt to **read** A’s contact by id (REST with B’s JWT, or temporary debug in app); expect **empty or error**.
- **C4** — As B, attempt **update** and **delete** on A’s `contacts` row; expect **failure**.
- **C5** — As B, attempt **insert** into `contact_labels` (or `contact_emails`) with A’s `contact_id` and B’s `user_id`; expect **failure** (RLS hardening migration).
- **C6** — Write a 4-row table in [progress.md](./progress.md) or [security.md](./security.md): `action | expected | observed | notes`. Link or file follow-up if anything unexpected passes.

---

## Block D: Release (Gate 4)

**Outcome:** Hosted web (and optionally Storybook); at least one installable mobile test build.

- **D1** — Netlify: create site; repo root or `apps/web` per your monorepo preference.
- **D2** — Set build command and publish directory to match `apps/web/netlify.toml` (adjust if your root build differs).
- **D3** — In Netlify UI, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (same values as **B5** / **B6**).
- **D4** — Deploy; open production URL; run a **subset** of **B8** (sign-in + one mutation).
- **D5** — EAS: `eas login`; `eas build:configure` in `apps/mobile` if not already done.
- **D6** — Run **Android** internal/preview build first; wait for artifact; install on a device.
- **D7** — When Apple side is ready: run **iOS** internal/simulator build; install or distribute via TestFlight per org process.
- **D8** — Log in progress: Netlify URL, EAS build IDs or store links; mark “release smoke” done or note gaps.

---

## Block E: Mobile hardening (optional)

**Outcome:** Sessions survive cold start; optional parity with web sign-up.

- **E1** — Read Supabase + Expo docs for **custom auth storage** using `expo-secure-store`.
- **E2** — Implement SecureStore adapter; pass into `createClient` `auth.storage`; remove or gate insecure fallback.
- **E3** — Kill app fully; relaunch; confirm session still valid without re-login.
- **E4** — Either add **sign-up** on mobile using `@widados/shared` validation, or document “deferred: web-only sign-up” in progress with reason.

---

## Block F: Phase 2 intake

**Outcome:** Scoped follow-ups without starting big Phase 2 code until Phase 1 gates are checked.

- **F1** — Export **Block A–D** checklist into your issue tracker (one issue per block or one epic + subtasks).
- **F2** — **Performance:** open a spike issue — “measure contact list at N rows; label search path” (no index changes without numbers).
- **F3** — **Import/export:** one issue — format choice (e.g. vCard), privacy, MVP cut line.
- **F4** — **Collaboration / tiers:** product issue only (no schema until product signs off).
- **F5** — **Ops:** one issue — error reporting (Sentry?), backups, on-call doc — pick one concrete next step.

---

## Optional calendar (flexible)


| When            | Blocks                                         |
| --------------- | ---------------------------------------------- |
| Day 1–2         | A1–A6                                          |
| Day 2–4         | B1–B9, then C1–C6                              |
| Week 2          | D1–D8; E1–E4 in parallel if mobile is priority |
| After A–C green | F1–F5                                          |


---

## One-line copy for an epic description

Phase 1 closeout: **A1–A6** (tooling+CI) → **B1–B9** (Supabase+env+smoke) → **C1–C6** (RLS doc) → **D1–D8** (Netlify+EAS) → optional **E1–E4** → **F1–F5** (Phase 2 tickets).

---

## References

- [Roadmap](./roadmap.md)
- [Progress](./progress.md)
- [Deployment](./deployment.md)