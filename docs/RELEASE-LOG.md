# Public release evidence

This credential-free summary records public verification without exposing source or artifact integrity values. Exact revisions, artifact digests, approval records, and recovery details remain in the private ops folder.

## Current application verification

| Field | Record |
| --- | --- |
| Public URL | https://consumer-credit-risk-workbench.pages.dev |
| Application status | Current default-branch source is deployed and reported by `/source.json` |
| Service status | Ready; database reachable; immutable release available |
| Immutable release ID | `f7c0c305-caf8-4003-9f1b-4aeacb37ec63` |
| Quality evidence | [Latest quality workflow](https://github.com/vaibhavkhuranaaa/consumer-credit-default-risk-monitoring/actions/workflows/quality.yml) |
| Verification date | 2026-08-18 |
| Verification method | Matching green default-branch workflow, anonymous source marker, health endpoint, current release endpoint, privacy boundary, and retired-surface checks |
| Production scope | Full 30,000-record non-demographic analyst workstation with the immutable evaluated release preserved |

The canonical deployment remains healthy. The superseded Cloudflare project discovered during the 2026-08-17 review was permanently deleted with owner approval on 2026-08-18. Its hostname no longer resolves, and the strengthened live verifier treats any future reachable legacy record surface as blocking.

The 2026-08-18 application release adds a research-only disposition register, open validation gates, validated cohort ranges, stale-inspector recovery, capacity-sensitivity framing, print support, and responsive validation evidence. It does not alter the immutable model evaluation or publish protected demographic fields.

## Release-integrity closure

| Field | Record |
| --- | --- |
| Cloudflare deployment ID | `9798756b-f2db-4bb5-b0ea-cfa470bda1f2` |
| GitHub quality evidence | [GitHub Actions run 31633863395](https://github.com/vaibhavkhuranaaa/consumer-credit-default-risk-monitoring/actions/runs/31633863395) |
| Verified at | 2026-08-12T19:43:33Z |
| Scope | Application-only deployment preserving the immutable evaluated release and governed analyst artifact |
| Checks | Source lineage, availability, database health, security headers, cache policy, immutable release, 30,000-row artifact contract, and demographic exclusion |

## Model-validation release

| Field | Record |
| --- | --- |
| Release ID | `f7c0c305-caf8-4003-9f1b-4aeacb37ec63` |
| Cloudflare deployment ID | `bfd5f35a-86b2-40cb-b260-4f8967703236` |
| GitHub quality evidence | [GitHub Actions run 31397767371](https://github.com/vaibhavkhuranaaa/consumer-credit-default-risk-monitoring/actions/runs/31397767371) |
| Verified at | 2026-08-10T14:53:18Z |
| Checks | Python tests, TypeScript lint, web tests, production build, artifact validators, accessibility and responsive review, live availability, privacy, cache, and security controls |

## Recovery evidence

The read-only recovery rehearsal verified the current deployment and nearest eligible prior deployment without changing traffic, secrets, roles, releases, providers, visibility, or billing. Exact recovery targets and integrity values remain private. The approval-gated procedure is in [AVAILABILITY-RUNBOOK.md](AVAILABILITY-RUNBOOK.md).

## Release rule

Any new deployment requires all of the following:

1. An exact local gate for the candidate.
2. A green GitHub Actions quality run for the same candidate.
3. Recorded human approval for publication or deployment.
4. Post-deployment verification of source lineage, availability, immutable release, artifact scope, privacy exclusions, cache, and security headers.

This log records evidence. It does not authorize deployment, rollback, teardown, visibility changes, or paid resources.
