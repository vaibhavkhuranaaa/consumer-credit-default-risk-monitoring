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

## M8 — Automated preview delivery decision

**Objective:** Decide whether pull-request previews are worth adding while keeping the private/$0 constraints explicit.

- Compare direct Wrangler deployment with Git-connected Cloudflare Pages previews and GitHub Actions deployment using a scoped Cloudflare API token.
- Document the lowest-risk option, exact required secret inventory, and rollback behavior.
- Implement only the approved option; otherwise retain direct deployment and record the decision.

Acceptance: the chosen workflow has a tested non-production preview path or a documented decision not to automate; production remains explicitly approved and aggregate-only.

Approval needed before implementation: authorization to connect the private GitHub repository to Cloudflare Pages and/or add a scoped deployment secret.

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
