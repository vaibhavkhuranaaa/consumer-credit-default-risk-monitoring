# Next milestone plan

## Starting point

M0–M6 are complete. The public, aggregate-only showcase is live at https://consumer-credit-default-risk-monitoring.pages.dev. The repository remains private. GitHub required branch protection is unavailable on the current private plan; no visibility or billing change is approved.

Run milestones in order. Complete one acceptance gate before starting the next.

## M7 — Release-control hardening

**Objective:** Make the existing manual release path auditable and repeatable without changing the public boundary or cost ceiling.

- Write a release checklist that records source revision, evaluation artifact hash, release ID, publisher identity, Cloudflare deployment URL, verification timestamp, and rollback target.
- Add a local pre-release command that runs Python tests, web tests/build, release-artifact validation, and public-payload forbidden-field checks before publishing.
- Document the compensating control for unavailable GitHub branch protection: required local gate plus green GitHub Actions run before deployment.
- Add a release log template that contains no credentials or raw data.

Acceptance: a dry-run checklist and validation command succeed from a clean local clone; a reviewer can trace the current public release to its code revision and aggregate artifact; no raw fields or credentials enter Git.

Approval needed: none, provided this remains local documentation and validation only. Approval is required before publishing a new public release.

**Completed 2026-08-05:** `scripts/pre_release_gate.py`, `docs/RELEASE-CHECKLIST.md`, and `docs/RELEASE-LOG.md` now provide the required local control and release lineage. The audit-mode gate passed without deployment.

## M8 — Full-record analyst product

**Objective:** Build the owner-approved, full-record academic UCI analyst workspace while retaining the retrospective no-decision boundary.

- Generate a checksum-traceable static artifact for all 30,000 licensed UCI source records.
- Support source-ID search, outcome and demographic filters, pagination, and complete field inspection.
- Keep the workbook, credentials, and model binaries local. Do not turn observed labels into an automated credit decision.

Acceptance: the local workspace loads all 30,000 approved UCI rows, filters and record inspection work, and the public artifact is rebuilt by the release gate.

Approval: recorded 2026-08-04 in `.project/approvals.yml` as `public_individual_record_scope`. Deployment remains subject to the passing release gate and GitHub Actions quality run.

## M9 — Observability and availability safeguards

**Objective:** Add lightweight, privacy-preserving evidence that the public read-only service is available and fails closed.

- Define health-check cadence and owner without collecting visitor identity or analytics.
- Add an unavailable-data dashboard state and a runbook for Neon wake-up, API failure, cache expiry, and Cloudflare rollback.
- Verify security headers, CORS, API caching, and the refusal boundary against the live endpoint.

Acceptance: a documented simulated unavailable state is correctly rendered; the runbook identifies an owner, first diagnostic command, rollback target, and teardown action.

Approval needed: approval for any third-party uptime monitor, scheduled job, or paid service. Local/manual verification needs no new approval.

## M10 — Portfolio-quality case-study package

**Objective:** Turn verified implementation evidence into a recruiter-ready narrative without overstating benchmark results.

- Expand the case study with architecture, data classification, release controls, model limitations, and the fixed-split caveat.
- Capture approved dashboard screenshots and link only public aggregate evidence.
- Add concise résumé/portfolio bullets generated from `.project/evidence.yml`.

Acceptance: every public claim cites a record; content clearly says retrospective benchmark, no live decisioning, and no out-of-time validation.

Approval needed before publication outside the existing site: approval of each new public channel and final copy.

## M11 — Teardown and ownership exercise

**Objective:** Prove the $0 deployment can be safely retired or handed over.

- Verify Cloudflare and Neon ownership, credentials rotation path, and export/retention boundary for aggregate release evidence.
- Rehearse a non-destructive rollback to the previous Cloudflare deployment.
- Update the teardown checklist with exact console locations and confirmation steps.

Acceptance: the owner can complete a rollback rehearsal without changing database release history; teardown steps are precise and do not affect local raw data.

Approval needed before an actual rollback, credential rotation, provider deletion, or any cost/visibility change.
