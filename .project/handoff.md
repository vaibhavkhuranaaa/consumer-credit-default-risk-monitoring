# Handoff

## Executive status

The live M9 release at https://consumer-credit-risk-workbench.pages.dev remains technically healthy and privacy-preserving, but its user experience is rejected as template-like and analytically shallow. A complete M10 replacement is now implemented and verified locally on `feature/m10-bi-dashboard`. It awaits explicit owner visual approval and separate deployment approval.

Do not describe the current public website or local candidate as portfolio-ready or industry-ready before the owner accepts the supplied screenshots. The live operational evidence remains valid; the local candidate has not been deployed. M10 remains the first unblocked milestone in `awaiting_visual_approval` state and supersedes case-study packaging.

## M10 local candidate ready for review

- Replaced rejected `DESIGN.md` with the approved local stakeholder decision map, information architecture, visual system, KPI glossary, chart grammar, interaction contract, responsive rules, accessibility states, safety language, and visual deployment gate.
- Preserved the version-3 30,000-row non-demographic artifact, immutable evaluation evidence, read-only API contracts, availability behavior, source/evaluation lineage, research-only boundary, and record-level investigation.
- Added five question-led views: Portfolio posture, Review planning, Cohort analysis, Model assurance, and Record review.
- Added global cohort filters; chart/matrix cross-filtering; active-filter context; score, limit, ratio, delinquency, payment/bill, capacity, gains, calibration, model-comparison, and governance analysis; chart data tables; loading, empty, unavailable, and refusal states.
- Removed rendered Fluent UI imports and used one native SVG/semantic HTML chart system. No new runtime dependency, API field, database change, telemetry, tracker, paid resource, or external transmission was added.
- Added substantive current project records: `.project/data.md`, `.project/evaluation.md`, `.project/publication.md`, data dictionary, metric glossary, case-study claim standard, and cross-agent adapters.
- Local verification at handoff: 14 web tests pass; production build passes; 1440×1000, 834×1112, and 390×844 browser checks show no document-level overflow or console warnings. Screenshots are in `docs/screenshots/m10/`.
- Candidate production build: 255.31 kB JavaScript / 76.87 kB gzip; 28.11 kB CSS / 6.30 kB gzip. Combined app assets are 33.3% smaller gzip than the rejected baseline (436.55 kB JavaScript / 4.20 kB CSS). The 15 MB analyst artifact remains the dominant load and transfer cost.
- Graphify was not run or transmitted. The current project-kit structural/record check passes without claiming semantic freshness; semantic sync remains pending its separate explicit transmission approval. The repository-local `project_kit.py check` remains the declared non-release gate.

### Next approval action

The owner reviews `desktop-portfolio.jpg`, `desktop-review-planning.jpg`, `tablet-portfolio.jpg`, and `mobile-portfolio.jpg` plus the test/build/bundle evidence. Record explicit visual acceptance or requested changes. Deployment, merge, publication, visibility, paid resources, rollback, and Graphify remain out of scope until separately approved.

## Verified release that must not be confused with design acceptance

- Public URL: https://consumer-credit-risk-workbench.pages.dev
- Application revision: `142462ab74d0a2e3eb7cce131830b9eff71b1a86`
- Cloudflare Pages deployment: `7b840f48-b262-40aa-8298-86deb84e6de3`
- Immutable aggregate release: `753cba75-e986-4128-a353-6ed2d7c411d9`
- Evaluated revision: `7f602e4977b824d9bc3ecb61a65a08e88adf5b67`
- Analyst artifact SHA-256: `31bb91f3a4dafcedeb55c31fc8e9f712cbe39da8369d8f8265bff29d3e4d696f`
- Evaluation SHA-256: `5b72d29dbc5b43375f185035f6c76654fd70b79dd69ac60708cf2ffa32b76eda`
- Published aggregate SHA-256: `353d03a21c41b33b83699f4c536f742f75aa2e5b8691d61aa1394ea31c0abdd1`

The clean local release gate, GitHub Actions quality run `31356386184`, database health, exact lineage, security/cache headers, 30,000-row artifact integrity, and protected-field exclusions passed. Preserve those controls while redesigning the product.

## Why the current dashboard was rejected

The current React implementation in `web/src/App.tsx` and `web/src/styles.css` is a generic Fluent UI dashboard shell rather than a decision product:

- The executive view is four equal KPI cards followed by prose-heavy panels.
- The score-band “distribution” is a row of mini-cards, not an analytical chart.
- The review-capacity control reports only limited precision/recall outputs and does not explain workload, captured defaults, false positives, or lift.
- The workbench provides a basic table, two filters, pagination, and a field dump, with little cohort or comparative analysis.
- The model lab exposes model jargon and metric cards without a non-technical decision narrative or strong visual comparisons.
- System typography, cobalt-on-white styling, repeated rounded cards, default component proportions, and automatic dark mode read as template-generated rather than deliberately designed.
- There is no cross-filtering, analytical drill path, question-led chart hierarchy, or visible chain from signal to business decision.

This diagnosis is a product-quality finding, not a request to add decorative charts or indiscriminate KPI tiles. “Maximum KPIs” means maximum useful decision coverage with a clear hierarchy, definitions, context, and traceability—not dashboard clutter.

## M10 outcome

Create a credible credit-risk BI product that a portfolio executive, operations lead, risk-governance reviewer, and analyst can use without understanding modeling terminology. The product remains a retrospective academic research workbench and must never issue or imply a lending decision.

Before implementation, replace the stale `DESIGN.md` with an explicit design contract covering stakeholder decisions, page hierarchy, typography, spacing, chart grammar, semantic color, table density, responsive behavior, accessibility, and all states. The concrete redesign plan in this handoff is approved for local implementation; public deployment is not approved.

### Stakeholder decisions the dashboard must answer

1. **Portfolio posture:** How much of the portfolio is observed default, elevated research risk, delayed in repayment, or concentrated by credit-limit amount?
2. **Review operations:** At 5%, 10%, 20%, 35%, and 50% review capacity, how many records enter the queue, how many observed defaults are captured, how many non-default records are reviewed, and what are precision, recall, and lift versus random review?
3. **Cohort concentration:** Which non-demographic score bands, delinquency severities, payment-to-bill profiles, and credit-limit cohorts concentrate observed default risk or reported limit amounts?
4. **Model assurance:** Which evaluated model ranks risk best, how well calibrated is it, what uncertainty is recorded, and what limitations prevent operational decision use?
5. **Analyst investigation:** Which records or cohorts warrant manual research review, and what verified source and derived fields explain their placement?
6. **Governance and reliability:** Is the data complete, which immutable release is being viewed, are protected attributes excluded, and is the service healthy?

### KPI contract

Group metrics by decision rather than placing them in one uniform card grid. Every KPI needs a definition, unit, denominator, interpretation, source, filter context, and plain-language tooltip.

**Portfolio posture**

- total records
- observed default count and rate
- high/elevated research-score count and share
- total, median, and average reported credit limit
- share of reported credit limits in high/elevated bands
- repayment-delay prevalence and severe-delay prevalence
- median payment-to-bill ratio and share below the approved low-ratio threshold

**Review-capacity scenario**

- selected review percentage and queue size
- observed defaults captured
- non-default reviews / false positives
- precision and recall
- capture-rate lift versus random selection
- incremental yield between capacity steps

**Model assurance**

- selected model PR-AUC and AUROC, translated into plain language
- Brier score and expected calibration error
- confidence interval or uncertainty where the evaluation artifact supports it
- evaluation sample size, immutable revision, and research-only status

**Data and service governance**

- rows, missing values, duplicate IDs, schema-validation status
- artifact/release identifier and freshness
- service health and last verified status
- explicit protected-attribute exclusion and no-decision boundary

### Required analytical visuals

Use real charts backed by the current artifact or evaluation evidence. A chart title should state the stakeholder question it answers. Each view must provide “what this means,” “decision supported,” and “limitation” context without generic filler.

- risk-band population bars with observed-default-rate overlay
- reported-credit-limit distribution by research-risk band using percentiles, box plots, or another honest distribution view
- delinquency-severity composition and observed default rate
- payment-to-bill ratio distribution and its relationship to observed default / research-risk segment
- review-capacity frontier showing workload, defaults captured, precision, recall, false positives, and lift
- cumulative gains and lift by score decile
- calibration curve against the ideal diagonal
- compact model-comparison chart for PR-AUC, AUROC, Brier, and calibration error, with uncertainty where available
- repayment-status heatmap across `PAY_0` through `PAY_6`, labeled as historical statement positions rather than a calendar time series
- bill and payment profiles across `BILL_AMT1..6` and `PAY_AMT1..6` for the selected cohort, with the same historical-sequence caveat
- concentration/Pareto view for reported credit-limit amount by risk band or score decile
- cohort matrix for delinquency severity by score band with population and observed default rate
- useful distributions for research score, reported credit limit, and payment-to-bill ratio

Do not invent a time dimension, forecast, causal relationship, benchmark, target, financial loss amount, or portfolio exposure definition that is absent from the evidence.

### Interaction contract

- Provide global filters for research-risk band, observed outcome, delinquency severity, reported-credit-limit range, payment-to-bill range, research-score range, and review-capacity scenario where supported.
- Cross-filter charts, KPIs, cohort summaries, and the record workbench; always show active filter context and a clear reset.
- Provide progressive disclosure: executive posture first, operational scenario next, then cohort/model detail and record inspection.
- Use plain business language first and put technical definitions in tooltips or drill-down detail.
- Preserve sortable/searchable/paginated full-record review and improve the inspector into an interpretable evidence trail.
- Preserve loading, empty, error, unavailable, and refusal states. Include accessible tabular alternatives or summaries for charts; never rely on color alone.
- Optimize desktop analytical density while remaining usable on tablet and mobile. A stable light presentation is preferred unless the owner approves another mode.

### Anti-slop acceptance criteria

- No sea of equal rounded cards, generic template shell, decorative gradient/glow/glass, oversized marketing hero, ornamental chart, arbitrary rainbow palette, meaningless icon/badge, or filler “insight” prose.
- No KPI or chart without a named decision, verified data source, and honest limitation.
- No model jargon as the primary label; translate it and retain the technical name secondarily.
- No mocked or fabricated production data. No protected attributes in public individual analytics. Aggregate fairness evidence, if shown, belongs in a clearly separated governance view and must remain within the documented policy.
- No automated approval, denial, prioritization recommendation, adverse-action language, or operational lending claim.
- One coherent charting system, restrained colorblind-safe semantic colors, aligned scales, consistent number formats, compact tables, and deliberate typography/spacing.
- The final desktop, tablet, and mobile screenshots require explicit human visual approval before deployment.

## Implementation sequence for the next chat

1. Read `AGENTS.md`, `PROJECT.md`, this handoff, `DESIGN.md`, architecture, milestones, state, approvals, evidence, the full web implementation, API contract, generated artifact schema, and evaluation outputs.
2. Audit what metrics can be computed client-side versus what requires a governed aggregate/API change. Do not fake missing evidence.
3. Replace `DESIGN.md` with the concrete stakeholder decision map and visual/interaction specification. Preserve business constraints from the rejected document.
4. Choose one charting approach after checking the existing dependencies, bundle impact, accessibility, and maintainability. Do not mix libraries or add an unjustified abstraction layer.
5. Implement only M10, preserving API compatibility, privacy boundaries, release lineage, health behavior, and record-level research workflow.
6. Add focused tests for metric calculations, filter interactions, chart/data fallbacks, accessibility, responsive behavior, and error/unavailable states. Verify the production build and capture representative screenshots.
7. Update architecture, evidence, state, and this handoff with verified facts. Run the full repository quality gate and `project-kit check`.
8. Stop before deployment. Present screenshots, test evidence, any bundle/performance trade-off, and the exact proposed deployment revision for explicit owner approval.

## Scope and safety boundaries

- Dataset: licensed UCI Default of Credit Card Clients, used retrospectively.
- Protected attributes: sex, education, marriage, and age remain excluded from model inputs and public individual analytics. They may be used only in the documented local aggregate fairness audit.
- Public product: research monitoring and manual analysis only; no automated credit decision or recommendation.
- Secrets: keep all credentials outside source. Cloudflare may retain only the already approved read-only `portfolio_api` connection credential and allowed origin as encrypted secrets.
- Current repository: private GitHub repository `vaibhavkhuranaaa/consumer-credit-default-risk-monitoring`, branch `release/m9-availability-hardening`, draft PR #1. Do not merge, change visibility, add billing, or exercise rollback/teardown without separate approval.
- Graphify: semantic freshness remains blocked. Do not transmit repository content unless the owner explicitly states: “I approve transmitting repository source and governance content to the configured Gemini-backed Graphify semantic service solely for project freshness.” No such transmission has occurred.

## Project-record reconciliation

The prior 80/100 structural debt is resolved with substantive real-data, evaluation, publication, dictionary, glossary, case-study, adapter, and portfolio-manifest records. The current assessment reports 100/100 structural presence and the non-release project-kit record check passes. Graphify semantic freshness remains separately pending because transmission to the configured external service is not approved; no Graphify source, output, or freshness signature was changed.

## Rollback note

The replacement project has no eligible previous rollback target. Deployment `c02d27b2-613b-475f-88d0-d74f3cb2f62f` failed health verification and must not be selected for rollback. The next chat must not deploy or rehearse rollback under M10.

## Continuation prompt

A ready-to-paste new-chat prompt is stored in `docs/NEXT-CHAT-PROMPT.md`.
