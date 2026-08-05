# Architecture decision

## Approved status

- Status: `approved — full-record analyst product authorized`
- Initial delivery: local Python evaluation plus React full-record analyst workspace and Cloudflare-ready aggregate evidence serving
- Cloud implementation: Neon Free in `aws-us-east-2` and Cloudflare Pages/Workers Free

## Decision boundary

The system supports an analyst's aggregate review of retrospective benchmark risk. It never approves, denies, prices, or recommends consumer credit.

## Data and feature policy

- Source: UCI Default of Credit Card Clients (CC BY 4.0), acquired and checksum-pinned in `.project/data-manifest.yml`.
- Raw source is checksum-pinned and ignored by Git. A generated public artifact may contain all licensed UCI records under the recorded owner approval.
- Sex, education, marriage, and age are excluded from training and thresholds. They are visible as source fields in the authorized analyst product, never model inputs or recommendations.
- Features use only pre-target repayment-history and financial values; ID and demographic fields are excluded. The benchmark has a single target horizon, so its fixed stratified evaluation is not an out-of-time test.

## Release architecture

`local source manifest → schema/range validation → generated full-record public artifact → browser analyst workspace`

`local source manifest → schema/range validation → leakage-safe features → baseline/challenger → aggregate release contract → Neon immutable evidence → Cloudflare read-only API → evaluation evidence`

## Release control

- Before every deployment, the publisher runs `scripts/pre_release_gate.py` from a clean worktree against the intended immutable Git revision and local aggregate artifact. The gate validates the artifact envelope and forbidden credentials or model fields, then runs Python tests, web lint/tests/build, and `project-kit check`.
- GitHub-required branch protection is unavailable while this repository remains private on the current plan. The compensating control is mandatory: a passing local pre-release gate and a green GitHub Actions `quality` run for the same commit are both required before deployment.
- `docs/RELEASE-CHECKLIST.md` and `docs/RELEASE-LOG.md` provide the credential-free evidence trail. Publishing, rollback, visibility, billing, and provider changes remain separately approval-gated.

## Scale and cost boundary

The deployed release uses Cloudflare Free plus Neon Free. Raw data stays local; the public API serves only an immutable aggregate release. Custom domains, paid capacity, and teardown require a new approval.
