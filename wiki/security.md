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
- Secure token handling in Expo secure storage
- Security headers for web delivery

## CI Security Gates
- Migration and policy validation
- Typecheck + lint
- Dependency audit and update hygiene

## Operational Hygiene
- `.env.example` tracked, real `.env` files ignored
- Key rotation playbook
- Backup and restore verification for production data
