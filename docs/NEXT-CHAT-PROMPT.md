# New-chat prompt: strengthen M10 evaluation and record simulation

Continue the consumer-credit-default-risk-monitoring project. Read `AGENTS.md`, `PROJECT.md`, `PRODUCT.md`, `DESIGN.md`, `.project/architecture.md`, `.project/milestones.yml`, `.project/state.md`, `.project/handoff.md`, `.project/approvals.yml`, `.project/evidence.yml`, `.project/data.md`, `.project/evaluation.md`, `.project/publication.md`, `docs/NEXT-MILESTONE-PLAN.md`, `docs/metric-glossary.md`, the real pipeline/tests, API, version-3 artifact schema, and evaluation artifacts before acting.

Complete only M10. The analyst-style visual rebuild exists locally on `feature/m10-bi-dashboard`, but M10 is `changes_requested`: its current fixed-holdout evidence is credible for retrospective academic research yet insufficiently explicit about baseline value, stability, uncertainty, freshness, and operational limitations. Do not restart the UI or discard verified M10 work.

Use the project-delivery and redesign-existing-projects skills. Audit the real evaluation implementation before editing. Reframe Model assurance as a Credit Risk Model Validation & Review-Capacity Lab and implement the approved strengthening contract end to end:

- Keep the existing 6,000-row holdout frozen and do not use it for further model or hyperparameter selection.
- Add deterministic repeated paired stratified evaluation on development data using identical folds across candidates.
- Add prevalence/random, logistic, and a documented simple repayment-delay-rule baseline.
- Report paired model deltas and uncertainty; report a tie when superiority is unresolved rather than overstating the selected challenger.
- Add confidence intervals for 5%, 10%, 20%, 35%, and 50% review-capacity metrics.
- Add stronger calibration diagnostics and sparse-bin warnings.
- Add sample-size-aware robustness for approved non-demographic credit-limit, delinquency-severity, and payment-to-bill cohorts.
- Add feature-group ablations as model-reliance/stability evidence, never causal explanations or adverse-action reasons.
- Add evaluation schema version, UTC generation time, source checksum, evaluated code revision, split identity, and command/tool lineage.
- Update all generated artifacts, hashes, validators, API/release contracts, dashboard views, glossary, evidence, tests, and documentation together. Do not fabricate missing evidence.

At record level, show only the out-of-fold retrospective research score, score band, deterministic rank/denominator, selected capacity, observed historical outcome, and `Inside simulated review set` or `Outside simulated review set`. Display exactly: `Retrospective research simulation only — not an approval, denial, price, adverse-action reason, or lending recommendation.` Refuse approval/denial, eligibility, pricing, adverse-action, recommendation, or `the model's decision` language. A disclaimer does not authorize an individual lending decision.

Preserve the licensed UCI-only boundary, demographic exclusions, local aggregate fairness audit, read-only APIs, privacy, lineage, health/availability behavior, full-record analysis, chart alternatives, filters, accessibility, and responsive design. Keep fixed-holdout evidence, repeated-development evidence, full-artifact cohort summaries, and live-service status visibly distinct.

Add focused Python and web tests. Regenerate governed artifacts and validate their checksums and forbidden fields. Run the production build and full repository gates, including `python3 scripts/project_kit.py check`. Capture refreshed 1440×1000 desktop, 834×1112 tablet, and 390×844 mobile screenshots, plus bundle/load impact. Refresh Graphify after the final documentation state so its manifest/report, Git commit, GitHub branch/PR, state, evidence, and handoff all reference the same exact revision.

Do not deploy, merge, publish, change visibility, add paid resources, change providers, exercise rollback/teardown, or transmit secrets. Stop before deployment and show the refreshed screenshots, model/evaluation evidence, tests, bundle/performance impact, exact revision, Graphify freshness evidence, and remaining limitations for explicit visual approval and separate deployment approval.
