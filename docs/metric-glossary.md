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

All review metrics use the fixed 6,000-row held-out evaluation and remain unchanged by artifact cohort filters.

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
| 10-bin expected calibration error | Weighted average score-versus-observed gap across bins | 0.0124 | Lower | Sparse high-score bins remain uncertain |

Verified values and intervals come from `artifacts/evaluation.json`; the public analyst artifact binds that file by SHA-256.

The strengthened evaluation will add paired baseline deltas, repeated-split stability, capacity confidence intervals, calibration slope/intercept, non-demographic cohort robustness, feature-group ablations, and explicit generation/revision lineage. Until those fields exist in the governed artifact, the dashboard must label them unavailable.

## Record-level research placement

| Metric | Definition | Source | Interpretation | Limitation |
| --- | --- | --- | --- | --- |
| Research-score rank | Position of a record when governed out-of-fold scores are sorted descending; ties use a documented deterministic order | Analyst artifact | Relative position within this academic artifact | Not a population percentile or policy rank |
| Simulated review placement | `Inside simulated review set` when rank is within the selected 5%, 10%, 20%, 35%, or 50% of artifact rows; otherwise `Outside simulated review set` | Rank plus selected capacity | Shows what the score-ranked research simulation includes | Not what a lender decided; never approval, denial, eligibility, pricing, or recommendation |

Required adjacent disclaimer: `Retrospective research simulation only — not an approval, denial, price, adverse-action reason, or lending recommendation.`
