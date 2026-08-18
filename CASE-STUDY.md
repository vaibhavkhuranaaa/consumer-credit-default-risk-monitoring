# Credit Risk Model Validation & Review-Capacity Lab

## Outcome

I built a read-only validation lab over 30,000 licensed academic credit records. It tests whether a selected non-demographic model is stable beyond simple references, shows uncertainty around five fixed review workloads, and lets a reviewer inspect retrospective rank sensitivity without turning that evidence into a lending decision.

The result is useful but not absolute. The selected model clears the prevalence/random, repayment-delay, and logistic references on repeated paired development evidence. It ties calibrated Extra Trees because the observed advantage does not clear the margin fixed in advance.

[Open the verified lab](https://consumer-credit-risk-workbench.pages.dev) · [View the source repository](https://github.com/vaibhavkhuranaaa/consumer-credit-default-risk-monitoring)

## Why this needed more than a model score

A headline AUROC can hide most of the questions that matter in review:

- Was the final holdout used once, or repeatedly consulted during selection?
- Would the result survive a different development split?
- Does the model beat simple references by enough to matter?
- What happens when review capacity is fixed at 5%, 10%, or 20%?
- Are the probabilities calibrated, or only well ranked?
- Where is the evidence thin?
- Can an analyst inspect a row without implying that a lender acted on it?

The project was reframed around model validation and review capacity so each of those questions has a visible answer and a limitation beside it.

## Source and boundary

The source is Yeh’s UCI Default of Credit Card Clients dataset, licensed CC BY 4.0. The acquired workbook contains 30,000 rows and 25 columns, with no missing cells or duplicate source IDs. It is a retrospective academic benchmark with one target horizon; it does not support an out-of-time claim.

Demographic fields, including sex, education, marriage, and age, are excluded from training and public individual records. They remain local and are used only in an aggregate fairness audit. The public analyst artifact contains licensed non-demographic fields, derived measures, and retrospective out-of-fold scores.

## Evaluation design

### Keep the final audit final

The original split is fixed at 18,000 training rows, 6,000 validation rows, and a 6,000-row holdout. Model selection stays locked to train and validation evidence. The holdout identity is frozen in the private integrity record and remains outside subsequent selection.

### Test development stability on shared folds

The 24,000 development rows are evaluated with two repeats of three stratified folds. Every candidate sees the same folds, so the metric differences are paired rather than comparisons of unrelated runs.

The reference ladder is intentionally plain:

- development-fold prevalence and expected random selection;
- a documented repayment-delay score with four fixed levels;
- standardized logistic regression;
- calibrated Extra Trees as the strongest model reference.

Paired 95% intervals are judged against fixed practical margins: `0.005` AUROC, `0.010` PR-AUC, `0.002` Brier, and `0.005` ECE. A difference that does not clear its margin is a tie.

## Evaluation result

On the frozen holdout, the selected calibrated histogram gradient-boosting model records:

| Metric | Result | 95% interval |
| --- | ---: | ---: |
| PR-AUC | `0.5764` | `0.5513–0.6058` |
| AUROC | `0.7916` | `0.7793–0.8059` |
| Brier score | `0.1314` | `0.1257–0.1365` |
| 10-bin ECE | `0.0124` | `0.0110–0.0237` |

Across six development folds, mean PR-AUC is `0.5513`, compared with `0.2212` for prevalence/random, `0.4480` for the repayment-delay rule, `0.5006` for logistic regression, and `0.5452` for calibrated Extra Trees.

The Extra Trees delta is `0.0061`, with a paired 95% interval of `0.0019–0.0109`. That interval does not clear the `0.010` practical margin. Reporting a tie is more informative than declaring a winner from a small numerical gap.

## Review-capacity evidence

Each approved workload at 5%, 10%, 20%, 35%, and 50% reports queue size, captured historical defaults, historical non-default reviews, precision, recall, lift, incremental yield, and bootstrap intervals.

At 10% capacity, the frozen holdout queue contains 600 rows:

- 431 historical defaults (`412–452`);
- 169 historical non-defaults (`148–188`);
- precision `0.7183` (`0.6867–0.7533`);
- recall `0.3248` (`0.3088–0.3434`);
- lift `3.2479` (`3.0880–3.4344`).

These numbers describe one historical audit sample. They are not a staffing forecast, financial benefit, or recommendation to act on a person.

## Calibration, cohorts, and model reliance

The calibration slope is `1.0743` and intercept is `0.0757`; ideal values are 1 and 0. The `0.8–0.9` score bin has only 18 rows and is marked sparse rather than smoothed into a confident visual.

Non-demographic cohort checks cover credit-limit band, delinquency severity, and payment-to-bill profile. Every row carries its sample size and interval. The Severe delinquency cohort has only 86 rows and is explicitly limited. The Higher payment-to-bill cohort has the lowest recorded cohort PR-AUC, `0.3084` (`0.2536–0.3643`), but cross-cohort PR-AUC values must be read with their different prevalence levels.

Feature-group ablations remove reported limit, repayment status, bill amounts, and payment amounts one group at a time across the repeated development folds. Removing repayment status produces the largest mean PR-AUC loss, `0.0982` (`0.0845–0.1141`). That is evidence about the fitted model’s reliance, not a cause, consumer explanation, or adverse-action reason.

## Product and design decisions

The final interface is a compact risk-validation workstation. The information hierarchy follows the reviewer’s path:

1. establish the research-only disposition and open evidence gates;
2. compare fixed review workloads;
3. check non-demographic cohort concentration;
4. review stability, calibration, and model reliance;
5. inspect deterministic rank and minimum simulated capacity;
6. confirm data quality and immutable lineage.

I used continuous comparison ledgers for model and capacity evidence instead of grids of isolated cards. Metric definitions and caveats open where they are needed, while semantic tables remain available behind charts. Native SVG kept the visual layer small and accessible without adding a chart library.

Mobile record review is a separate composition, not a squeezed desktop table. Loading, empty, error, unavailable, and refusal states are treated as normal product states. Browser verification at 1440×1000, 834×1112, and 390×844 found no document overflow, console errors, page errors, or automated WCAG A/AA violations. One contrast rule remained automated-incomplete where overlapping elements prevented background inference.

## Safe record inspection

A public record may show only its academic source ID, retrospective out-of-fold score, score band, deterministic rank and denominator, selected capacity, historical outcome, and minimum simulated capacity.

The interface displays:

> This rank sensitivity is not an approval, denial, price, adverse-action reason, or lending recommendation.

It refuses lending-decision, eligibility, pricing, adverse-action, recommendation, and “the model decided” wording.

## Architecture and release control

The evaluation and release pipeline runs locally from the checksum-pinned workbook. It produces a version-2 evaluation artifact, a version-2 aggregate release, and a version-4 non-demographic analyst artifact with deterministic ranking and immutable lineage.

The React application is served from Cloudflare Pages. Read-only health and release Functions use a least-privilege Neon connection. The public path accepts no viewer writes, stores no credentials in source, and fails closed when required artifacts or release health are invalid.

Before deployment, one gate regenerates and validates governed artifacts, runs the Python and web suites, builds production assets, and checks project records. GitHub Actions must pass for the same immutable candidate. The current local candidate passes 27 Python tests, 16 web tests, TypeScript lint, the production build, artifact validators, and the repository gate.

The exact evaluated application revision is recorded privately as `historical-release`. Evaluation was generated at `2026-08-10T14:20:10.827594+00:00`; live verification completed at `2026-08-10T14:53:18Z`. Artifact integrity values remain in the private release evidence rather than public copy.

## What remains unresolved

- One historical academic population and one target horizon; no calendar-time or true out-of-time test.
- No external, geographic, prospective, drift, or operational validation.
- Repeated development folds are correlated views of the same source population.
- No causal, loss, pricing, staffing, or consumer-decision claim.
- The approximately 15 MB governed data artifact dominates transfer and load cost.
- Automated accessibility checks still need manual keyboard, zoom, screen-reader, and contrast review.
- The portfolio case-study package is prepared in M11, but publishing it and changing repository visibility remain separate approvals.

The defensible conclusion is narrow: the model is usable for retrospective research simulation, and it is not validated for lending use.
