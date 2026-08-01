# Architecture decision

## Approved status

- Status: `approved — local-only first release verified`
- Initial delivery: local Python evaluation plus Cloudflare-ready React/Pages Function and Neon Postgres release-serving implementation
- Cloud authority: none; external provisioning remains blocked pending M6 approval

## Decision boundary

The system supports an analyst's aggregate review of retrospective benchmark risk. It never approves, denies, prices, or recommends consumer credit.

## Data and feature policy

- Source: UCI Default of Credit Card Clients (CC BY 4.0), acquired and checksum-pinned in `.project/data-manifest.yml`.
- Raw source is checksum-pinned, ignored by Git, and never served publicly.
- Sex, education, marriage, and age are excluded from training and thresholds; any diagnostic use is separately documented.
- Features use only pre-target repayment-history and financial values; ID and demographic fields are excluded. The benchmark has a single target horizon, so its fixed stratified evaluation is not an out-of-time test.

## Release architecture

`local source manifest → schema/range validation → Parquet validation → leakage-safe features → baseline/challenger → aggregate release contract → Neon immutable evidence → Cloudflare read-only API → public dashboard`

## Scale and cost boundary

Local evaluation remains the only approved release. The implementation is prepared for Cloudflare Free plus Neon Free; repository creation, provider provisioning, public exposure, custom domains, paid capacity, and teardown require M6 approval with an owner and rollback decision.
