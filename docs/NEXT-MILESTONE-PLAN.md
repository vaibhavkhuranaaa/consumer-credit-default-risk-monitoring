# Next milestone plan

## Starting point

M0–M10 are complete. The owner-approved M10 application revision `d3e5b103b63a8e222d36084c85eed302f6b35398` is live and verified at `https://consumer-credit-risk-workbench.pages.dev` with immutable release `f7c0c305-caf8-4003-9f1b-4aeacb37ec63`.

Complete milestones in order. The next task must work only on M11 and must not change the verified deployment or publish the case study without new approval.

## M10 — Evidence-led model validation and BI decision dashboard

**Objective:** make the dashboard answer whether the research model is meaningfully and stably better than simple alternatives, what a score-ranked review simulation includes, and why the evidence is not an individual lending decision.

### Visual corrective pass — complete and owner-approved

Preserve all verified evaluation, artifact, API, privacy, availability, filtering, and record-simulation behavior. Do not restart the product or change its data contract.

1. Audit the current React/CSS implementation against the rejected visual fingerprints in `DESIGN.md`.
2. Replace the cream/serif/teal editorial system with a cool-neutral, sans-serif, compact internal-risk-workstation system.
3. Remove oversized rhetorical headings, ordinal eyebrows, equal KPI-card grids, repeated panel-header formulas, and redundant explanatory prose.
4. Rebuild Model validation around a comparison ledger, capacity evidence, calibration/robustness detail, and one persistent limitations context—not a long sequence of cards.
5. Rebuild Record simulation as a mobile-capable review workflow whose essential columns and inspector are usable without treating a clipped desktop table as the main experience.
6. Preserve semantic HTML, keyboard behavior, chart alternatives, loading/empty/error/refusal states, and all decision-language refusals.
7. Capture a wholly new desktop/tablet/mobile screenshot set. The rejected 2026-08-10 screenshots are historical evidence only and must not be presented for approval again.

All seven corrective steps are implemented, locally verified, and owner-approved. The replacement evidence is `desktop-validation-workstation.png`, `desktop-record-review.png`, `tablet-validation-workstation.png`, and `mobile-record-review.png`.

### Evaluation work — implemented locally

- Freeze the existing 6,000-row holdout. Do not use it for additional model or hyperparameter selection.
- Run repeated paired stratified evaluation on development data and report stability across identical folds.
- Add prevalence/random, logistic, and a documented simple repayment-delay rule as reference baselines.
- Report paired model deltas and uncertainty. Treat overlapping or unresolved differences as a tie.
- Add confidence intervals for the 5%, 10%, 20%, 35%, and 50% review-capacity metrics.
- Add stronger calibration diagnostics and sparse-bin warnings.
- Add sample-size-aware robustness by approved non-demographic credit-limit, delinquency, and payment-to-bill cohorts.
- Add feature-group ablations as model-reliance evidence, never causal or adverse-action reasons.
- Add schema version, UTC generation timestamp, source/evaluation checksums, evaluated code revision, split identity, and command/version lineage to generated evidence.

### Product work — implemented locally

- Lead Model assurance with a plain-language readiness verdict and explicit supported/prohibited uses.
- Keep fixed-holdout, repeated-development, full-artifact cohort, and live-service evidence visually distinct.
- At the selected capacity, show each public record's score, band, deterministic rank/denominator, and `Inside simulated review set` or `Outside simulated review set`.
- Use the adjacent disclaimer: `Retrospective research simulation only — not an approval, denial, price, adverse-action reason, or lending recommendation.`
- Refuse individual approval/denial, eligibility, pricing, adverse-action, or recommendation requests and offer the simulated-review placement instead.
- Preserve privacy, API availability states, record search/sort/pagination, accessible chart alternatives, responsive layouts, and immutable lineage.

### Acceptance

- Evaluation tests prove split isolation, deterministic repeated folds, paired calculations, capacity intervals, freshness fields, and forbidden-field exclusions.
- Web tests prove readiness/unavailable/refusal states and record-level placement at every approved capacity.
- The production build and repository gate pass from the exact candidate revision.
- New desktop, tablet, and mobile screenshots show the strengthened evidence and record inspector without overflow or browser warnings.
- Graphify, Git, GitHub, project records, and handoff describe the same revision and status.
- Obtain explicit visual approval and separate deployment approval before publication; both gates passed for the recorded M10 production release. Future mutations remain separately gated.

The implementation uses evaluation schema version 2, analyst artifact version 4, and aggregate release schema version 2. M10 is complete and its approved application is verified in production. Future deployment, merge, case-study publication, visibility, billing, rollback, and provider changes remain separately prohibited.

## M11 — Package the verified portfolio case study

**Next unblocked milestone.** Package the approved project as an evidence-linked portfolio case study without changing the product or publishing it.

1. Audit `CASE-STUDY.md`, `portfolio/project.json`, and the case-study standard against the final M10 evidence.
2. Distinguish the academic source vintage, evaluation generation time, evaluated revision, visual approval revision, and currently deployed M10 application revision.
3. Use only verified model, calibration, robustness, capacity, accessibility, performance, and lineage claims with adjacent limitations.
4. Use the owner-approved replacement screenshots; exclude the rejected `.jpg` candidate from presentation evidence.
5. Preserve the retrospective research-only, no-lending-decision, privacy, and local aggregate-fairness boundaries.
6. Validate links, artifact hashes, portfolio schema, repository checks, and responsive case-study presentation if applicable.
7. Stop for owner approval before publication, deployment, merge, or visibility changes.

## M12 — Exercise rollback and teardown ownership

Blocked by M11 and separately approval-gated. Failed deployment `c02d27b2-613b-475f-88d0-d74f3cb2f62f` remains ineligible as a rollback target.
