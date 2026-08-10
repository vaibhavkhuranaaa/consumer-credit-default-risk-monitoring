# Architecture decision

## Approved status

- Status: `verified — full-record analyst product deployed`
- Initial delivery: local Python evaluation plus React full-record analyst workspace and Cloudflare-ready aggregate evidence serving
- Cloud implementation: Neon Free in `aws-us-east-2` and Cloudflare Pages/Workers Free

## Decision boundary

The system supports an analyst's aggregate review of retrospective benchmark risk. It never approves, denies, prices, or recommends consumer credit.

## Data and feature policy

- Source: UCI Default of Credit Card Clients (CC BY 4.0), acquired and checksum-pinned in `.project/data-manifest.yml`.
- Raw source is checksum-pinned and ignored by Git. A generated public artifact contains licensed non-demographic UCI fields under a deliberately narrower implementation boundary.
- Sex, education, marriage, and age are excluded from training, thresholds, and public individual records. They remain local and are used only for documented aggregate fairness diagnostics.
- Features use only pre-target repayment-history and financial values; ID and demographic fields are excluded. The benchmark has a single target horizon, so its fixed stratified evaluation is not an out-of-time test.

## Release architecture

`local source manifest → schema/range validation → evaluation-selected out-of-fold scores + derived measures → generated analyst artifact → executive overview / portfolio workbench / model lab`

`local source manifest → schema/range validation → leakage-safe features → baseline/challenger → aggregate release contract → Neon immutable evidence → Cloudflare read-only API → evaluation evidence`

`manual verification → database-backed health and release lineage → fail-closed analyst state → Cloudflare rollback diagnostic`

## Release control

- Before every deployment, the publisher runs `scripts/pre_release_gate.py` from a clean worktree against the intended immutable Git revision and local aggregate artifact. The gate validates the artifact envelope and forbidden credentials or model fields, then runs Python tests, web lint/tests/build, and `project-kit check`.
- GitHub-required branch protection is unavailable while this repository remains private on the current plan. The compensating control is mandatory: a passing local pre-release gate and a green GitHub Actions `quality` run for the same commit are both required before deployment.
- `docs/RELEASE-CHECKLIST.md` and `docs/RELEASE-LOG.md` provide the credential-free evidence trail. Publishing, rollback, visibility, billing, and provider changes remain separately approval-gated.

## Scale and cost boundary

The deployed release uses Cloudflare Free plus Neon Free. Raw data stays local; the public API serves only an immutable aggregate release. Custom domains, paid capacity, and teardown require a new approval.

The analyst workspace is served as a generated static artifact from Cloudflare Pages. The local successor publishes non-demographic research rows and retrospective scores, never a model binary or consumer-credit recommendation. Static and Function responses carry explicit cache/security contracts, and Functions emit structured failure events without visitor analytics. Pages does not accept the Workers-only `observability` configuration block; operational review uses the existing Cloudflare deployment and Function logs without a scheduled or third-party monitor. Deployment remains approval-gated.
