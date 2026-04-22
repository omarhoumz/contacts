# Security

## Core Principles
- Deny-by-default data model via RLS
- Least privilege for all credentials
- Validation at every trust boundary
- No secrets in source control

## Data Security Model
- Every user-owned row includes `user_id`
- RLS policy target: `auth.uid() = user_id`
- Service role key never exposed to clients

## App Security Controls
- Shared zod validation in `packages/shared`
- Rate limiting on sensitive operations
- Secure token handling in Expo secure storage (see **Expo + Supabase session storage** below)
- Security headers for web delivery

## Expo + Supabase session storage (research, E1)

**Goal:** Keep refresh + access tokens off plain `AsyncStorage` on mobile; align with Supabase Auth’s pluggable storage.

**Recommended approach**

1. **`expo-secure-store`** for values that must survive app restarts and resist trivial extraction on a rooted/jailbroken device (still not a hardware security module, but better than unencrypted async storage).
2. Pass a **custom `auth.storage` adapter** into `createClient(url, anonKey, { auth: { storage: … } })` from `@supabase/supabase-js` (same pattern as web’s `localStorage` / custom adapters). Implement `getItem` / `setItem` / `removeItem` using `SecureStore` with keys namespaced per app (e.g. `widados.auth.token`).
3. **Size limits:** SecureStore values are small (~2 KB per item on iOS); store **session JSON in one key** or split only if under limits; avoid storing large blobs.
4. **Refresh:** Supabase client already refreshes access tokens when using the default auth flow; ensure the adapter is **async** and awaited consistently (no race on cold start).
5. **Web vs mobile:** Web keeps `persistSession: true` with browser storage; mobile uses the secure adapter only in `apps/mobile`.

**References**

- [Supabase Auth: Create a client](https://supabase.com/docs/reference/javascript/initializing#custom-storage) — `auth.storage`
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Supabase + Expo guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native) — session patterns

**Implementation (E2):** `apps/mobile/supabaseStorage.ts` implements `getItem` / `setItem` / `removeItem` with `expo-secure-store`; `App.tsx` passes `auth: { persistSession: true, storage: supabaseAuthStorage }` into `createClient`. **E3:** manual cold-restart session check remains.

## CI Security Gates
- Migration and policy validation
- Typecheck + lint
- Dependency audit and update hygiene

## Operational Hygiene
- `.env.example` tracked, real `.env` files ignored
- Key rotation playbook
- Backup and restore verification for production data
