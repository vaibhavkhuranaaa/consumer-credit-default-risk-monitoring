# Decision-dashboard metric glossary

## Portfolio posture

| Metric | Definition and denominator | Source | Interpretation | Limitation |
| --- | --- | --- | --- | --- |
| Records in view | Governed artifact rows after all active global filters | Analyst artifact | Active cohort denominator | Academic sample, not a live portfolio |
| Observed default rate | Observed-default rows ÷ records in view | Analyst artifact | Historical outcome concentration | Not a forecast |
| Elevated / high score share | Elevated + High band rows ÷ records in view | Out-of-fold artifact score bands | Upper research-band concentration | Not a policy threshold |
| Reported limit total / median / mean | Sum and distribution summaries of `LIMIT_BAL` | Analyst artifact | Reported limit magnitude and shape | Not balance, loss, or exposure at default |
| Upper-band limit share | Summed `LIMIT_BAL` in Elevated + High bands ÷ summed `LIMIT_BAL` in view | Analyst artifact | Reported-limit concentration by research band | Not financial exposure |
| Repayment delay prevalence | Delayed + Severe rows ÷ records in view | Derived artifact field | Historical repayment-status concentration | Six statement positions are not dates |
| Median payment-to-bill ratio | Median derived ratio in view | Derived artifact field | Descriptive payment profile | Clipped; not affordability evidence |
| Low-ratio share | Rows below the documented 0.10 ratio cut ÷ records in view | Derived artifact field | Descriptive low-ratio concentration | Analytical cut, not a policy or target |

## Review planning

All review metrics use the frozen 6,000-row held-out evaluation and remain unchanged by artifact cohort filters. Captured defaults, non-default reviews, precision, recall, lift, and incremental yield report deterministic bootstrap 95% intervals at every approved point; queue size is fixed by capacity.

| Metric | Definition | Desired direction | Limitation |
| --- | --- | --- | --- |
| Queue size | Holdout rows × selected 5%, 10%, 20%, 35%, or 50% capacity | Context-dependent | Simulation, not staffing forecast |
| Captured observed defaults | Observed holdout default labels in the selected score-ranked set | Higher for fixed capacity | Not prevented defaults |
| Non-default reviews | Queue size − captured observed defaults | Lower for fixed capture | Not an adverse decision |
| Precision / yield | Captured defaults ÷ queue size | Higher | Threshold-specific retrospective estimate |
| Recall / capture | Captured defaults ÷ all observed holdout defaults | Higher | Threshold-specific retrospective estimate |
| Lift versus random | Precision ÷ holdout observed-default prevalence | Above 1 indicates concentration | Not return on investment |
| Incremental yield | Additional captured defaults ÷ additional reviews from the prior capacity point | Higher | Prespecified discrete steps only |

## Model assurance

| Metric | Plain-language meaning | Verified selected result | Direction | Limitation |
| --- | --- | ---: | --- | --- |
| PR-AUC | Ranking quality with emphasis on the observed-default class | 0.5764 | Higher | Fixed holdout |
| AUROC | Overall ranking separation across thresholds | 0.7916 | Higher | Fixed holdout |
| Brier score | Mean squared score error against observed labels | 0.1314 | Lower | Does not capture every calibration defect |
| 10-bin expected calibration error | Weighted average score-versus-observed gap across bins | 0.0124 (`0.0110–0.0237`) | Lower | Sparse high-score bins remain uncertain |
| Calibration slope | Logistic calibration fit of observed outcomes on score log-odds | 1.0743 | Near 1 | Global diagnostic; does not remove bin-level uncertainty |
| Calibration intercept | Intercept from the same calibration fit | 0.0757 | Near 0 | Global diagnostic; single historical holdout |
| Repeated-development PR-AUC | Mean PR-AUC across two repeats of three paired stratified development folds | 0.5513 | Higher | Development stability, not holdout or out-of-time evidence |
| Paired PR-AUC delta vs Extra Trees | Selected minus Extra Trees on identical development folds | +0.0061 (`0.0019–0.0109`) — tie | Positive beyond the 0.010 resolution margin | Small difference does not resolve superiority |

Verified values and intervals come from evaluation schema version 2 in `artifacts/evaluation.json`; the version-4 analyst artifact binds that file by SHA-256 and records UTC generation time, evaluated revision, source checksum, split identity, and command/tool lineage.

The selected model is better than prevalence/random, the documented repayment-delay rule, and logistic regression on paired development evidence. Added complexity over calibrated Extra Trees is unresolved under the prespecified practical-resolution margins and is reported as a tie.

## Robustness and model reliance

| Evidence | Definition | Verified result | Limitation |
| --- | --- | --- | --- |
| Cohort robustness | PR-AUC, AUROC, Brier, ECE, sample size, outcome count, and intervals within credit-limit, delinquency, and payment-to-bill cohorts | Severe delinquency is limited (`n=86`); Higher payment-to-bill PR-AUC is `0.3084` (`0.2536–0.3643`) | PR-AUC changes with prevalence; cohorts are descriptive and non-demographic |
| Repayment-status ablation | Performance loss when the six repayment-status fields are removed in repeated development folds | PR-AUC loss `0.0982` (`0.0845–0.1141`) | Model reliance only; not a cause or consumer explanation |
| Reported-limit ablation | Performance loss when `LIMIT_BAL` is removed | PR-AUC loss `0.0036` (`0.0028–0.0044`) | Model reliance only |
| Bill-amount ablation | Performance loss when six bill fields are removed | PR-AUC loss `0.0056` (`0.0031–0.0080`) | Model reliance only |
| Payment-amount ablation | Performance loss when six payment fields are removed | PR-AUC loss `0.0012` (`-0.0006–0.0028`) — tie | Reliance unresolved |

## Record-level research placement

| Metric | Definition | Source | Interpretation | Limitation |
| --- | --- | --- | --- | --- |
| Research-score rank | Position after governed out-of-fold scores are rounded to six public decimals and sorted descending; ties use source ID ascending | Analyst artifact | Relative position within this 30,000-row academic artifact | Not a population percentile or policy rank |
| Simulated review placement | `Inside simulated review set` when rank is within the selected 5%, 10%, 20%, 35%, or 50% of artifact rows; otherwise `Outside simulated review set` | Rank plus selected capacity | Shows what the score-ranked research simulation includes | Not what a lender decided; never approval, denial, eligibility, pricing, or recommendation |

Required adjacent disclaimer: `Retrospective research simulation only — not an approval, denial, price, adverse-action reason, or lending recommendation.`

The record-level interface shows only academic source ID, retrospective score, band, rank/denominator, selected capacity, historical outcome, and simulated placement. Lending-decision, eligibility, pricing, adverse-action, recommendation, and “the model decided” language is refused.
