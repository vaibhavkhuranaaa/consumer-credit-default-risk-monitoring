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

## Product, accessibility, and performance gate

The dashboard must translate model metrics into plain language, distinguish artifact-cohort metrics from fixed holdout evaluation, provide chart data tables, preserve loading/empty/error/unavailable/refusal states, work at desktop/tablet/mobile breakpoints, and avoid document-level responsive overflow. Build size and test results are M10 implementation evidence, not deployed claims.

## Limitations

No out-of-time validation, causal interpretation, financial-loss estimate, production benchmark, operational staffing forecast, protected-attribute individual analysis, or automated lending decision is supported.
