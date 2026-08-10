# Analyst artifact data dictionary

| Field | Stakeholder label | Meaning / unit | Public use | Limitation |
| --- | --- | --- | --- | --- |
| `ID` | Source row ID | Academic dataset row identifier | Search and record traceability | Not a consumer identity |
| `LIMIT_BAL` | Reported credit limit | Source-reported currency amount | Cohort distribution and concentration | Not balance, loss, or exposure at default |
| `PAY_0`, `PAY_2`…`PAY_6` | Historical repayment status | Six ordered statement positions; negative/zero values indicate paid/current patterns, positive values indicate delay magnitude | Sequence composition and record evidence | Not a dated calendar time series |
| `BILL_AMT1`…`BILL_AMT6` | Reported bill amounts | Source currency amounts at six historical statement positions | Cohort profile and record evidence | Not financial exposure or cash flow |
| `PAY_AMT1`…`PAY_AMT6` | Reported payment amounts | Source currency amounts at six historical statement positions | Cohort profile and record evidence | No affordability or income inference |
| `default payment next month` | Observed default outcome | Binary historical next-period source label | Aggregate rate and record evidence | Retrospective label, not a forecast |
| `research_score` | Retrospective research score | Out-of-fold score from 0 to 1 | Cohort grouping and research inspection | Not a production score or lending recommendation |
| `score_band` | Research-risk band | Very low, Low, Moderate, Elevated, or High deterministic grouping | Cross-filter and comparison | Not a policy threshold |
| `utilization_proxy` | Utilization proxy | Derived ratio from reported bill and limit fields | Descriptive record evidence | Can exceed 1; not verified utilization at decision time |
| `payment_to_bill_ratio` | Payment-to-bill ratio | Deterministic derived ratio clipped to 0–10 | Cohort distribution and record evidence | Not affordability evidence |
| `mean_repayment_status` | Mean repayment status | Average of six source status values | Descriptive record evidence | Averaging masks position-level detail |
| `delinquency_severity` | Repayment severity | Current or paid, Delayed, or Severe derived grouping | Cross-filter and cohort matrix | Descriptive, not an adverse-action reason |
| `limit_band` | Reported-limit cohort | `≤50k`, `50k–140k`, `140k–300k`, or `>300k` | Cohort grouping | Unequal interval widths |

Sex, education, marriage, and age are forbidden in public individual records. They remain local and aggregate-fairness-audit only.
