# Architecture

## Current deployment

The product is a read-only retrospective research workstation.

```text
licensed UCI workbook
  -> local schema and range validation
  -> locked model selection and frozen holdout evaluation
  -> versioned evaluation and release artifacts
  -> governed non-demographic analyst artifact
  -> React workstation on Cloudflare Pages
  -> read-only health and release functions
  -> immutable aggregate release in Neon Postgres
```

The browser computes portfolio and cohort views over the governed static artifact. Cloudflare Pages serves the application and static evidence. Pages Functions expose only health and the current aggregate release. Neon uses a least-privilege read credential for the live functions and a separate local publisher credential for an approved release. Viewers have no write path.

## Failure boundaries

- Missing or invalid analyst evidence fails closed and exposes no partial records.
- Missing database or release evidence returns an unavailable service state.
- Protected attributes are excluded from model inputs and public individual analytics.
- Application source lineage and immutable model-release lineage are verified separately.
- Rollback changes application assets only; it does not rewrite release history.

## Scale path

The current 30,000-row artifact favors a simple, zero-dollar read-only deployment. At materially larger row counts, move filtered aggregates and paginated records behind a read-only API. Preserve schema validation, privacy tests, rate limits, deterministic ranking, immutable release evidence, and fail-closed behavior. Recurring validation would also require time-indexed data, scheduled evaluation ownership, drift thresholds, alerting, and retention approval.

## Limits

This topology is evidence for a public academic demonstration, not a production lending system. It has no write workflow, uptime guarantee, scheduled monitoring, custom domain, or paid capacity.
