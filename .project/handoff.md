# Handoff

## Executive status

M0–M9 remain complete. The public M9 Cloudflare release is technically verified and privacy-preserving but visually stale. The analyst-style M10 replacement is implemented and verified locally on `feature/m10-bi-dashboard`; however, the owner requested changes before visual acceptance after reviewing whether the model evidence is current and usable.

M10 is now `changes_requested`, not complete and not approved for deployment. The next task must strengthen evaluation/readiness evidence and add safe record-level simulated review placement, then regenerate verification evidence and stop for approval.

## Current verified facts

- Public URL: `https://consumer-credit-risk-workbench.pages.dev`
- Public application revision: `142462ab74d0a2e3eb7cce131830b9eff71b1a86`
- Public Cloudflare deployment: `7b840f48-b262-40aa-8298-86deb84e6de3`
- Immutable aggregate release: `753cba75-e986-4128-a353-6ed2d7c411d9`
- Evaluated release revision: `7f602e4977b824d9bc3ecb61a65a08e88adf5b67`
- Analyst artifact SHA-256: `31bb91f3a4dafcedeb55c31fc8e9f712cbe39da8369d8f8265bff29d3e4d696f`
- Evaluation SHA-256: `5b72d29dbc5b43375f185035f6c76654fd70b79dd69ac60708cf2ffa32b76eda`
- Published aggregate SHA-256: `353d03a21c41b33b83699f4c536f742f75aa2e5b8691d61aa1394ea31c0abdd1`
- Last live verification: `2026-08-10T04:45:15Z`
- Existing local M10 candidate revision before this handoff: `0e071ad1e33d8166d8f23092e51a6d948ea94d4a`
- Existing local M10 verification: 14 web tests, production build, and responsive browser checks at 1440×1000, 834×1112, and 390×844 passed without document-level overflow or console warnings.
- Existing local bundle: 255.31 kB JavaScript / 76.87 kB gzip plus 28.11 kB CSS / 6.30 kB gzip. Combined application assets are 33.3% smaller gzip than the rejected baseline. The approximately 15 MB governed artifact remains the main transfer/load cost.

Do not confuse recent artifact generation, code revision, or live-service verification with current real-world model validation. The source is one historical UCI academic dataset with no temporal or external validation.

## Current evaluation judgment

The selected calibrated histogram gradient-boosting model records holdout PR-AUC `0.5764`, AUROC `0.7916`, Brier `0.1314`, and 10-bin ECE `0.0124` on 6,000 fixed holdout rows. At 10% capacity, 600 rows enter the simulated review set, 431 of 1,327 observed defaults are captured, precision is `0.7183`, recall is `0.3248`, and 169 reviewed rows are observed non-defaults.

This is useful retrospective academic ranking evidence. It is not current-population, out-of-time, external, drift, prospective, or operational validation. The selected model materially exceeds logistic regression but only narrowly exceeds calibrated Extra Trees, with overlapping reported uncertainty. The correct current conclusion is `usable for research simulation; not validated for lending use`.

## Approved M10 change

Reframe the product as a **Credit Risk Model Validation & Review-Capacity Lab**. The dashboard must show whether added model complexity provides stable evidence over simple baselines, what workload/capture trade-offs look like with uncertainty, where performance weakens, and what evidence is missing before operational use.

The next local implementation must:

1. Keep the 6,000-row holdout frozen and out of further model selection.
2. Add repeated paired stratified development evaluation using identical folds across candidates.
3. Add prevalence/random, logistic, and a documented simple repayment-delay-rule baseline.
4. Add paired model deltas, uncertainty, and an explicit tie outcome when superiority is unresolved.
5. Add confidence intervals for every approved review-capacity point.
6. Add calibration slope/intercept or a documented equivalent plus sparse-bin warnings.
7. Add non-demographic cohort robustness with sample sizes and uncertainty.
8. Add feature-group ablations described only as model reliance/stability evidence.
9. Add schema version, UTC generation time, source checksum, evaluated revision, split identity, and tool/command lineage to generated evidence.
10. Update the dashboard's Model assurance view around a plain-language readiness verdict, supported uses, prohibited uses, baselines, stability, uncertainty, calibration, robustness, and freshness.

Do not silently replace verified metrics. Update artifacts, documentation, tests, hashes, and public-artifact lineage together when the strengthened evaluation is generated.

## Record-level simulation boundary

The owner requested visibility into what the model would do for an individual record. The permissible implementation is not an individual lending decision:

- Show the record's out-of-fold retrospective research score and score band.
- Rank governed artifact scores deterministically for the selected 5%, 10%, 20%, 35%, or 50% capacity.
- Show `Inside simulated review set` or `Outside simulated review set`, plus rank/denominator, capacity, observed historical outcome, artifact hash, and evaluation hash.
- Display: `Retrospective research simulation only — not an approval, denial, price, adverse-action reason, or lending recommendation.`
- Refuse and do not render `approved`, `denied`, `accepted`, `rejected`, `eligible`, `ineligible`, pricing, adverse-action reasons, recommendations, or `the model's decision`.

A disclaimer does not make lending-decision semantics safe or accurate. This placement is only a transparent view of score rank in an academic artifact.

## Existing M10 UI to preserve

- Five question-led views: Portfolio posture, Review planning, Cohort analysis, Model assurance, and Record review.
- Global non-demographic cohort filters, chart/matrix cross-filtering, active-filter context, reset, search, sorting, pagination, and grouped record evidence.
- Native accessible SVG/semantic HTML charts and tabular alternatives; no chart dependency or Fluent UI rendering.
- Loading, empty, invalid, support-unavailable, and refusal states.
- Stable light BI design, privacy exclusions, research-only language, read-only APIs, and immutable release lineage.

The existing screenshots in `docs/screenshots/m10/` document the pre-strengthening candidate and are no longer sufficient for approval. Capture refreshed desktop, tablet, and mobile evidence after implementation.

## Authority and prohibited actions

- Local evaluation strengthening and safe record-level simulated review placement are approved in `.project/approvals.yml`.
- One project-scoped Graphify semantic refresh is approved on 2026-08-10. It authorizes only repository/governance semantic freshness and no unrelated content, secrets, raw ignored data, deployment, or paid resource.
- Do not deploy, publish, merge, change repository visibility, add billing or paid resources, exercise rollback/teardown, change providers, or transmit secrets.
- Sex, education, marriage, and age remain excluded from model inputs and public individual analytics. They remain local aggregate-fairness inputs only.
- The failed deployment `c02d27b2-613b-475f-88d0-d74f3cb2f62f` is not an eligible rollback target.

## Graphify freshness

The owner approved and Graphify completed the project-scoped semantic refresh on 2026-08-10. The integrity diagnostic reports no dangling endpoints, missing endpoints, self-loops, or directed/undirected edge collapse. Graphify marked `pnpm-workspace` from `web/pnpm-workspace.yaml` unverified, the initial incremental merge warned that semantic edges lacked the optional `source_file` field, and Graphify reported skill text version `0.9.23` versus runtime package `0.9.31`; do not hide those provenance limitations. Exact graph totals belong in verification output rather than this self-referential source document. No credentials, ignored raw dataset, deployment, paid resource, or unrelated repository content was transmitted.

## Next-task sequence

1. Read all project contracts and audit the current pipeline, tests, artifact schemas, dashboard, API, and evaluation evidence.
2. Design the smallest credible strengthened evaluation without contaminating the frozen holdout.
3. Implement evaluation, schema, artifact, and dashboard changes end to end.
4. Add focused Python and web tests, including forbidden decision-language tests.
5. Regenerate artifacts and validate privacy/lineage.
6. Run web lint/tests/build, Python tests, the repository gate, and `python3 scripts/project_kit.py check`.
7. Capture desktop, tablet, and mobile screenshots plus bundle and load evidence.
8. Update architecture, evidence, state, handoff, Graphify, Git, and GitHub to the same exact revision.
9. Stop before deployment and present the evidence for explicit visual approval and separate deployment approval.

## Continuation prompt

Use `docs/NEXT-CHAT-PROMPT.md` verbatim or paste the prompt from the final response that created this handoff.
