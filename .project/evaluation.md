# Evaluation contract

## Decision and scope

Evaluation asks whether a non-demographic model can rank and calibrate next-period observed-default labels well enough for retrospective research and bounded review-capacity simulation. It does not validate an operational lending policy or consumer decision.

## Split and leakage controls

- Fixed stratified 60/20/20 train/validation/test split with random state `20260801`.
- Model selection is locked on validation evidence; reported model comparison is on the fixed 6,000-row holdout.
- Inputs contain 19 pre-target financial and repayment fields. `ID`, sex, education, marriage, age, and the target are excluded.
- The source has one target horizon. No calendar-time or out-of-time performance claim is allowed.

## Required technical evidence

- Ranking: PR-AUC and AUROC, with 95% intervals where recorded.
- Calibration: Brier score, 10-bin expected calibration error, and calibration curve.
- Capacity: 5%, 10%, 20%, 35%, and 50% review points with queue size, captured observed defaults, non-default reviews, precision, recall, lift versus random, and incremental yield.
- Concentration: score-decile observed-default rate, lift, and cumulative gains.
- Fairness: local aggregate diagnostics only, separated from public individual analytics.

## Verified selected result

The validation-locked calibrated histogram gradient-boosting model records holdout PR-AUC `0.5764` (95% interval `0.5513–0.6058`), AUROC `0.7916` (`0.7793–0.8059`), Brier `0.1314` (`0.1257–0.1365`), and 10-bin calibration error `0.0124`. The exact machine-readable source is `artifacts/evaluation.json`, bound to the analyst artifact by evaluation SHA-256 `5b72d29dbc5b43375f185035f6c76654fd70b79dd69ac60708cf2ffa32b76eda`.

## Current usability assessment

The current evidence is credible for an academic retrospective ranking and review-capacity demonstration. At 10% capacity on the 6,000-row holdout, 600 rows enter the simulated review set, 431 observed defaults are captured, precision is `0.7183`, recall is `0.3248`, and 169 reviewed rows are observed non-defaults. The selected model materially exceeds logistic regression, but its advantage over calibrated Extra Trees is small and the reported confidence intervals overlap. The evidence therefore supports a model-family comparison and bounded research simulation, not a claim that one champion is decisively superior.

It is not sufficient for present-day forecasting or operational lending use. The source is one historical academic population with a single target horizon; there is no temporal, external, geographic, prospective, drift, or live-policy validation. The current machine-readable evaluation also lacks an explicit generation timestamp and evaluated code revision.

## Approved M10 strengthening contract

The next local pass must improve decision usefulness without using the holdout for further selection:

- Keep the existing 6,000-row holdout frozen as the final audit set.
- Measure split stability on the remaining development data with repeated stratified cross-validation using identical folds across candidate models.
- Add prevalence/random, logistic, and a documented simple repayment-delay rule as reference baselines.
- Use paired resampling to report model-performance deltas and their uncertainty. If the challenger advantage is not resolved, report a statistical tie and prefer the model justified by calibration, stability, complexity, and runtime evidence.
- Add confidence intervals for each prespecified review-capacity point and show queue size, captured observed defaults, observed non-default reviews, precision, recall, lift, and incremental yield.
- Add calibration slope/intercept or another documented global calibration diagnostic and warnings for sparse high-score bins.
- Add robustness tables for approved non-demographic cohorts such as credit-limit band, delinquency severity, and payment-to-bill profile, always with sample size and uncertainty.
- Add feature-group ablations for repayment status, bill amounts, payment amounts, and reported limit. Describe these as model reliance/stability evidence, never causal reasons.
- Stamp generated evaluation artifacts with schema version, UTC generation time, source checksum, evaluated code revision, split identity, and command/version lineage.

Repeated cross-validation is development/stability evidence; it does not turn this single-horizon dataset into out-of-time validation. Fairness diagnostics remain local and aggregate only.

## Safe record-level simulation

For a selected capacity, a public record may show `Inside simulated review set` or `Outside simulated review set`, derived deterministically from its out-of-fold research-score rank within the governed artifact. The inspector must also show the capacity, rank/denominator, score, score band, observed historical outcome, and artifact/evaluation lineage. It must say: `Retrospective research simulation only — not an approval, denial, price, adverse-action reason, or lending recommendation.`

The interface must refuse requests to convert this placement into an individual lending decision. A disclaimer does not authorize decision language.

## Product, accessibility, and performance gate

The dashboard must translate model metrics into plain language, distinguish artifact-cohort metrics from fixed holdout evaluation, provide chart data tables, preserve loading/empty/error/unavailable/refusal states, work at desktop/tablet/mobile breakpoints, and avoid document-level responsive overflow. Build size and test results are M10 implementation evidence, not deployed claims.

## Limitations

No out-of-time validation, causal interpretation, financial-loss estimate, production benchmark, operational staffing forecast, protected-attribute individual analysis, or automated lending decision is supported.
