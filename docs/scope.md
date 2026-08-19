# Scope

## Supported decisions

- Compare a validation-locked non-demographic model with simple references.
- Review ranking, calibration, repeated-split stability, cohort robustness, and feature-group reliance.
- Compare five fixed historical review-capacity scenarios with uncertainty.
- Inspect an academic record's deterministic rank, minimum simulated capacity, and selected-scenario cutoff context.

## Public data boundary

The public artifact contains licensed non-demographic UCI source fields, deterministic derived measures, retrospective out-of-fold scores, score bands, and ranks. Sex, education, marriage, and age remain local and appear only in aggregate fairness diagnostics. Credentials, direct identity data, model binaries, approval, denial, eligibility, pricing, adverse-action reasons, and lending recommendations are prohibited.

## Evidence boundary

The source is one historical academic population with one target horizon. Results are not calendar-time, out-of-time, external, geographic, prospective, drift, operational, causal, loss, pricing, or lending-decision validation. Review-capacity metrics describe a frozen historical sample, not staffing or financial benefit.

## Cost and operations

The live demo uses Cloudflare and Neon free tiers. No paid resource, scheduled monitoring, provider change, rollback, teardown, custom domain, visibility change, or secret transmission is authorized without a new recorded approval.
