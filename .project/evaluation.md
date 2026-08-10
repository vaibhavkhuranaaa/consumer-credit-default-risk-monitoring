# Evaluation contract

## Decision and scope

Evaluation asks whether a non-demographic model provides stable ranking and calibration evidence beyond simple references and what uncertainty surrounds bounded retrospective review-capacity simulations. It does not validate an operational lending policy or consumer decision.

## Split and leakage controls

- Fixed stratified 60/20/20 train/validation/holdout split with random state `20260801`.
- Model selection remains locked on the original 18,000-row training and 6,000-row validation evidence.
- The 6,000-row holdout identity is frozen at SHA-256 `df4a7f48dc14f491d592e858e1b128cb975ad83e1281de330876eb307cef2215` and is excluded from further model or hyperparameter selection.
- Repeated development evidence uses the combined 24,000 train/validation rows only: two repeats of three-fold stratified evaluation with identical folds across candidates.
- Inputs contain 19 pre-target financial and repayment fields. `ID`, sex, education, marriage, age, and the target are excluded.
- The source has one target horizon. No calendar-time or out-of-time performance claim is allowed.

## References and tie rule

- **Prevalence/random:** constant development-fold prevalence for probability metrics and analytic expected random selection with lift `1.0` for capacity context.
- **Logistic:** standardized logistic regression over the same approved 19 fields.
- **Repayment-delay rule:** fixed scores of `0.70` when `PAY_0 ≥ 2`, `0.45` when any repayment field is at least 2, `0.25` when any repayment field is at least 1, and `0.10` otherwise. It is a target-free research reference, not a lending rule.
- Paired deltas use the same development folds. A result is a tie unless its paired 95% interval clears the prespecified practical-resolution margin in the better direction: AUROC `0.005`, PR-AUC `0.010`, Brier `0.002`, and ECE `0.005`.

## Verified strengthened result

The validation-locked calibrated histogram gradient-boosting model retains frozen-holdout PR-AUC `0.5764` (95% interval `0.5513–0.6058`), AUROC `0.7916` (`0.7793–0.8059`), Brier `0.1314` (`0.1257–0.1365`), and 10-bin ECE `0.0124` (`0.0110–0.0237`).

Across six repeated development folds, its mean PR-AUC is `0.5513` versus prevalence/random `0.2212`, repayment-delay rule `0.4480`, logistic `0.5006`, and calibrated Extra Trees `0.5452`. Paired evidence supports superiority over prevalence/random, the repayment rule, and logistic regression. Its mean PR-AUC delta over Extra Trees is `0.0061` (paired 95% interval `0.0019–0.0109`), which does not clear the `0.010` practical-resolution margin; the correct verdict is **tie**.

The readiness verdict is: **usable for retrospective research simulation; not validated for lending use**.

## Review-capacity uncertainty

Every approved capacity point reports queue size, captured observed defaults, observed non-default reviews, precision, recall, lift versus random, incremental yield, and bootstrap 95% intervals. At 10% capacity, the fixed queue contains 600 holdout rows, captures 431 observed defaults (`412–452`), includes 169 observed non-defaults (`148–188`), records precision `0.7183` (`0.6867–0.7533`), recall `0.3248` (`0.3088–0.3434`), and lift `3.2479` (`3.0880–3.4344`). These are audit-sample estimates, not staffing or benefit forecasts.

## Calibration, robustness, and reliance

- Calibration slope is `1.0743` and intercept is `0.0757`; ideal values are 1 and 0.
- The `0.8–0.9` score bin has only 18 rows and triggers the governed sparse-bin warning.
- Non-demographic holdout robustness covers credit-limit band, delinquency severity, and payment-to-bill profile with sample sizes and intervals. The Severe delinquency cohort has `n=86` and is explicitly limited; the Higher payment-to-bill cohort has the lowest recorded cohort PR-AUC (`0.3084`, interval `0.2536–0.3643`). Cross-cohort PR-AUC values are not directly comparable without considering prevalence.
- Repeated-development ablations remove reported limit, repayment status, bill amounts, and payment amounts one group at a time. Repayment-status removal records the largest mean PR-AUC loss (`0.0982`, interval `0.0845–0.1141`). These are model-reliance and stability diagnostics only, never causes, consumer explanations, or adverse-action reasons.

## Evidence schema and lineage

Evaluation schema version `2` records UTC generation time, extracted-source SHA-256, evaluated Git revision, exact command, Python/NumPy/pandas/scikit-learn versions, train/validation/development/holdout row counts and ID checksums, baseline definitions, repeated split identities, uncertainty, and limitations. `artifacts/evaluation.json` is the machine-readable local source. The governed analyst artifact binds it by SHA-256 and removes local aggregate fairness diagnostics before public serving.

The refreshed local approval candidate was generated at `2026-08-10T13:39:08.437643+00:00` from evaluated revision `543dc446c48b2cc2208f2e6362863563a0f7514d`. Its evaluation SHA-256 is `89e518d29368cced94a64f8261ee51ba74647f676c3717a499007a081fb37063`; analyst artifact v4 SHA-256 is `2107393a06617da72bb388837cb3464e3701dc9fd7d94873d190ee3ce607ff19`.

## Safe record-level simulation

For a selected capacity, a public record may show only its academic source ID, out-of-fold retrospective score, score band, deterministic rank/denominator, selected capacity, historical outcome, and `Inside simulated review set` or `Outside simulated review set`. Rank uses the published six-decimal score descending with source ID ascending as the tie-breaker.

The adjacent statement is mandatory: `Retrospective research simulation only — not an approval, denial, price, adverse-action reason, or lending recommendation.` The interface refuses lending-decision, eligibility, pricing, adverse-action, recommendation, and “the model decided” language.

## Limitations

No out-of-time, external, geographic, prospective, drift, operational, causal, financial-loss, protected-attribute individual, or automated lending-decision validation is supported. Repeated folds reduce dependence on one development split but remain correlated views of one historical academic population.
