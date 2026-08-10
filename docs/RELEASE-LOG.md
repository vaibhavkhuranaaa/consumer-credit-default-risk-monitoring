# Release log

This credential-free log traces an approved public aggregate release to the local artifact and its immutable source revision. Never enter secrets, connection strings, raw data, individual records, protected-attribute values, predictions, or model binaries.

## Template

| Field | Record |
| --- | --- |
| Release ID | `<UUID from artifacts/release.json>` |
| Source revision | `<full immutable Git SHA>` |
| Evaluation artifact hash | `<SHA-256 of artifacts/evaluation.json>` |
| Aggregate release artifact hash | `<SHA-256 of artifacts/release.json>` |
| Analyst artifact hash | `<SHA-256 of web/public/data/analyst-workspace.json>` |
| Publisher identity | `<named human; never a credential or role secret>` |
| Deployment URL | `<approved public URL>` |
| Verification timestamp | `<UTC ISO-8601 timestamp>` |
| Rollback target | `<exact prior approved Cloudflare Pages deployment>` |
| Local gate | `<pass/fail and timestamp>` |
| GitHub Actions quality | `<green run URL for the same SHA>` |

## Verified current public release

| Field | Record |
| --- | --- |
| Release ID | `7e667054-cb2a-406f-b843-d458b87ad68c` |
| Source revision | `6e10495a76be508b1e912161397111b57612bae1` |
| Evaluation artifact hash | `sha256:65e0b277155a198a5b36176e64124944780c715ddaeb34d694777a4c0b0c5b7b` |
| Aggregate release artifact hash | `sha256:177f36810238cdeed7a9f9d6b1ae73dde41170dad3d45b9d27b257d679a764ee` |
| Full-record public artifact hash | Not applicable to the historical aggregate-only release |
| Publisher identity | Vaibhav Khurana (approved release owner) |
| Deployment URL | https://consumer-credit-default-risk-monitoring.pages.dev |
| Verification timestamp | `2026-08-01T21:38:26Z` (deployment record commit time) |
| Rollback target | Immediately preceding approved Cloudflare Pages deployment, selected from the Pages deployment history |
| Local gate | Passed in M7 audit mode at `2026-08-05T04:17:57Z`; no deployment performed |
| GitHub Actions quality | Green quality run required before deployment; existing deployment record notes the quality checks passed |

The current release is historical evidence only. This entry does not authorize redeployment or rollback.

## Verified full-record analyst workspace

| Field | Record |
| --- | --- |
| Release ID | `4cd50ffb-5cae-4812-aaad-f7631821feb1` |
| Source revision | `b02193103a17bdc9e14158aecec10d9aba11cc08` |
| Evaluation artifact hash | `sha256:65e0b277155a198a5b36176e64124944780c715ddaeb34d694777a4c0b0c5b7b` |
| Aggregate release artifact hash | `sha256:8030d484efb362d328a8b52ff3ee9c18677ee41d11847e2877e64ec6dad2978c` |
| Full-record public artifact hash | `sha256:0d5b2a2640e8c6c142c7979a8ade06bb28826d983bf1372d5eaccbe3a06859ca` |
| Publisher identity | Vaibhav Khurana (approved release owner) |
| Deployment URL | https://consumer-credit-default-risk-monitoring.pages.dev |
| Verification timestamp | `2026-08-05T04:55:52Z` |
| Rollback target | Immediately preceding approved Cloudflare Pages deployment, selected from the Pages deployment history |
| Local gate | Passed from a clean worktree before deployment |
| GitHub Actions quality | Green: https://github.com/vaibhavkhuranaaa/consumer-credit-default-risk-monitoring/actions/runs/30976446944 |

## Verified privacy-preserving analyst workspace

| Field | Record |
| --- | --- |
| Release ID | `753cba75-e986-4128-a353-6ed2d7c411d9` |
| Aggregate release revision | `7f602e4977b824d9bc3ecb61a65a08e88adf5b67` |
| Application revision | `142462ab74d0a2e3eb7cce131830b9eff71b1a86` |
| Evaluation artifact hash | `sha256:5b72d29dbc5b43375f185035f6c76654fd70b79dd69ac60708cf2ffa32b76eda` |
| Published aggregate artifact hash | `sha256:353d03a21c41b33b83699f4c536f742f75aa2e5b8691d61aa1394ea31c0abdd1` |
| Analyst artifact hash | `sha256:31bb91f3a4dafcedeb55c31fc8e9f712cbe39da8369d8f8265bff29d3e4d696f` |
| Publisher identity | Vaibhav Khurana (approved release owner) |
| Deployment URL | https://consumer-credit-risk-workbench.pages.dev |
| Cloudflare deployment ID | `7b840f48-b262-40aa-8298-86deb84e6de3` |
| Verification timestamp | `2026-08-10T04:45:15Z` |
| Rollback target | None in the replacement project; preceding deployment `c02d27b2-613b-475f-88d0-d74f3cb2f62f` failed health verification |
| Local gate | Passed from a clean worktree for application revision `142462ab74d0a2e3eb7cce131830b9eff71b1a86` |
| GitHub Actions quality | Green: https://github.com/vaibhavkhuranaaa/consumer-credit-default-risk-monitoring/actions/runs/31356386184 |
| Live verification | Availability, security headers, cache policy, exact aggregate lineage, 30,000-row contract, and demographic-field exclusion passed |

## Verified M10 model-validation and review-capacity lab

| Field | Record |
| --- | --- |
| Release ID | `f7c0c305-caf8-4003-9f1b-4aeacb37ec63` |
| Source and application revision | `d3e5b103b63a8e222d36084c85eed302f6b35398` |
| Evaluation artifact hash | `sha256:4d284b8f47fcf32ee599e1652a0ac0d09914784a5e5fd69f7fae8d6283c35fff` |
| Published aggregate artifact hash | `sha256:346e5e1687d7803a0f38b6656cd11f05ba2130fed80701f5d9630564733b8c71` |
| Analyst artifact hash | `sha256:fb9ba15d059471904c8b982243aee6d36e69eb982b98a861b5b1b8478ec0247b` |
| Publisher identity | Vaibhav Khurana (approved release owner) |
| Deployment URL | https://consumer-credit-risk-workbench.pages.dev |
| Cloudflare deployment ID | `bfd5f35a-86b2-40cb-b260-4f8967703236` |
| Verification timestamp | `2026-08-10T14:53:18Z` |
| Rollback target | Verified M9 deployment `7b840f48-b262-40aa-8298-86deb84e6de3`, diagnostic only until separately approved |
| Local gate | Passed from clean exact candidate: 19 Python tests, TypeScript lint, 15 web tests, production build, artifact validators, and project records |
| GitHub Actions quality | Green: https://github.com/vaibhavkhuranaaa/consumer-credit-default-risk-monitoring/actions/runs/31397767371 |
| Live verification | Availability, database health, security headers, cache policy, exact release/revision lineage, 30,000-row version-4 contract, and demographic-field exclusion passed |
