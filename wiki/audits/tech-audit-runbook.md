# Tech Audit Runbook (A to Z)

This runbook defines the end-to-end process for recurring full-stack technical audits in this repository.

Use this as the standard operating procedure (SOP) for planning, executing, and operationalizing audits.

## 1) Purpose

- Provide a repeatable audit framework that is evidence-driven and actionable.
- Detect delivery, architecture, security, and quality risks early.
- Convert findings into prioritized work with owners and timelines.

## 2) Scope

Default full audit scope:
- `apps/web`
- `apps/mobile`
- `apps/backend`
- `packages/*` (especially `packages/shared`)
- CI/CD and runtime configs (`.github/workflows`, `netlify.toml`, root scripts)
- Engineering docs (`wiki/*.md`)

Optional scope extensions:
- Performance profiling deep dive
- Cost/infra optimization review
- Third-party dependency and license audit

## 3) Audit Cadence

Recommended:
- Full audit: every quarter
- Focused risk audit: monthly
- Post-incident targeted audit: within 5 business days of major incident

Scheduling rule:
- Put next planned full audit date into `wiki/roadmap.md` and review in the monthly planning cycle.

## 4) Roles and Responsibilities

- Audit Lead (Architect/Staff): owns execution and final readout
- Domain Leads (Web/Mobile/Backend): provide context and confirm implementation intent
- Security Owner: validates security findings and mitigation priority
- PM: prioritizes findings backlog against product goals
- Engineering Manager: confirms owner assignment and timeline commitments

## 5) Inputs and Preconditions

Before starting:
- Branch and baseline commit are frozen and recorded.
- CI is green (or current failures are documented as known baseline issues).
- Required env/setup docs are accessible.
- Current roadmap and architecture docs are available.

Required baseline capture:
- Branch name
- Short commit SHA
- `git status --short`
- Outputs of:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`

## 6) Severity and Scoring Model

Severity:
- Critical: security/data loss/prod outage risk
- High: major reliability or delivery blocker
- Medium: maintainability/quality drag
- Low: optimization or documentation hygiene

Risk score:
- Likelihood (1-5) x Impact (1-5)
- Use score for prioritization, severity for communication

## 7) Evidence Standard

Each finding must include:
- Unique ID
- Severity and score
- Area (architecture, security, testing, etc.)
- Concrete evidence (paths/symbols/command output)
- User/business impact
- Recommended remediation
- Effort estimate (S/M/L)
- Proposed owner

No evidence = no finding.

## 8) Audit Execution Workflow

### Phase 0: Setup and Charter
- Confirm scope and timeline
- Capture baseline
- Confirm severity rubric and output templates

### Phase 1: Architecture and Design
- Validate boundaries between web/mobile/shared/backend
- Check coupling and blast radius
- Compare implementation to architecture docs

### Phase 2: Code Quality and Maintainability
- Analyze hook bloat, duplicate logic, oversized modules
- Validate state ownership model:
  - router URL state
  - query/cache server state
  - auth/session state
  - ephemeral UI state
- Audit `useEffect` usage for anti-patterns:
  - stale closure risk
  - dependency drift
  - synchronization effects that should be derived state

### Phase 3: Data/Auth/Security
- Review auth and session flows
- Validate redirect safety and trust boundaries
- Check validation from UI to DB
- Verify DB constraints, RLS posture, and privileged function handling
- Review secret handling and environment hygiene

### Phase 4: Delivery and Operations
- Evaluate CI coverage and gate trust
- Verify release/rollback readiness
- Check runtime/toolchain version consistency across local/CI/deploy

### Phase 5: Testing and QA Strategy
- Map test coverage by critical user journey
- Identify manual-only and flaky risk areas
- Confirm PM/QA defect lifecycle and closure criteria

### Phase 6: Documentation and Governance
- Validate docs freshness and consistency
- Confirm decision traceability (code vs docs/ADRs)
- Identify process debt and ownership gaps

### Phase 7: Synthesis and Readout
- Publish findings register, risk matrix, roadmap, and exec summary
- Hold readout with PM + Eng leads
- Convert accepted items into tracked roadmap/backlog tasks

## 9) Required Deliverables

For each full audit, produce:
- `audit-findings.md`
- `audit-risk-matrix.md`
- `audit-remediation-roadmap.md`
- `audit-exec-summary.md`

Recommended location:
- `wiki/audits/YYYY-MM-full-tech-audit/`

## 10) Templates

### 10.1 Findings Entry Template

Use this structure per finding:

```md
ID: F-###
Severity: High
Score: 16 (Likelihood 4 x Impact 4)
Area: Architecture
Evidence:
- `path/to/file.ts` (`symbolName`)
- command output: `<summary>`
Impact:
- What can fail, who is affected, and frequency
Recommendation:
- Concrete remediation
Effort: M
Owner: Frontend Lead
```

### 10.2 Risk Matrix Entry Template

```md
Risk ID | Description | Likelihood | Impact | Score | Severity | Owner
```

### 10.3 Roadmap Entry Template

```md
Horizon: 0-30d / 30-90d / 90+d
Work item:
Owner:
Dependencies:
Success metric:
Target date:
```

## 11) Trust Calibration for Quality Gates

For each gate (lint, typecheck, test), explicitly record:
- What it catches well
- What it does not catch
- Current confidence (`High`, `Medium`, `Low`)
- Required actions to raise confidence

Example:
- Test gate confidence is low if scripts are placeholders or critical journeys lack tests.

## 12) Anti-Pattern Review Guide (`useEffect` and State)

Mark as risk when:
- Effect mirrors props/state that could be derived
- Effect depends on broad objects instead of stable primitives
- Effect performs orchestration across unrelated domains
- Effect intentionally uses timer/microtask ordering to hide sequencing issues

Preferred replacements:
- Route loaders/guards for navigation orchestration
- TanStack Query for server-state lifecycle
- Derived state (`useMemo`) for computed values
- Domain-focused hooks with narrow contracts

## 13) Exit Criteria (Audit Complete)

Audit is complete only when:
- Top risks are evidence-backed and prioritized
- Owners are assigned for top 10 findings
- Timelines are agreed for 0-30d actions
- PM confirms prioritization direction
- Audit artifacts are linked in `wiki/roadmap.md`

## 14) Follow-up Governance

After readout:
- Create implementation backlog from accepted findings
- Add checkpoints at 2/4/8 weeks to verify remediation progress
- Re-score open risks after each checkpoint
- Carry unresolved high/critical risks into the next planning cycle

## 15) Scheduling the Next Audit

At closure, always schedule the next full audit:
- Add a dated entry in `wiki/roadmap.md`
- Include:
  - target week,
  - owner,
  - intended scope changes (if any),
  - pre-audit prerequisites

Suggested line item format:

```md
[Audit] Full stack tech audit - YYYY-MM (Owner: <name>, Scope: web/mobile/backend/shared)
```

## 16) Quick Start Checklist

- [ ] Confirm scope and cadence
- [ ] Freeze baseline commit and capture gate outputs
- [ ] Run architecture/code/security/delivery/process phases
- [ ] Build findings register + risk matrix
- [ ] Produce 0-30/30-90/90+ roadmap
- [ ] Present readout and assign owners
- [ ] Schedule next audit in roadmap

