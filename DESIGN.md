# Credit risk decision dashboard design contract

## Status and boundary

Status: M10 evaluation strengthening is verified, but the 2026-08-10 visual candidate is owner-rejected. Its editorial cream/serif/teal treatment, oversized question headings, repeated eyebrow labels, bordered KPI-card grids, and report-like explanation panels are superseded and must not be reused. Public deployment remains prohibited.

This product is a retrospective academic research workbench built from the licensed UCI Default of Credit Card Clients dataset. It supports portfolio posture, review-capacity planning, cohort comparison, model validation, governance review, and restricted record simulation. It never approves, denies, determines eligibility, prices, supplies adverse-action reasons, or recommends credit. Protected attributes are excluded from model inputs and public individual analytics.

## Owner rejection and corrective objective

The next M10 pass must look like purpose-built model-validation software used by an internal credit-risk team, not an editorial portfolio page or a recognizable generated dashboard template. Preserve the verified evaluation, contracts, interactions, privacy boundary, accessibility states, and record restrictions; redesign only the presentation and information hierarchy.

The rejected candidate's screenshots remain historical evidence only. They are not a visual baseline, approval candidate, or source of reusable style tokens.

## Stakeholder decision map

| Stakeholder | Question | Evidence | Supported action | Hard limitation |
| --- | --- | --- | --- | --- |
| Portfolio executive | Where are observed defaults, elevated research scores, repayment delays, and reported limits concentrated? | Full governed artifact, filtered cohort metrics, score-band and limit distributions | Select a cohort for further retrospective analysis | No forecast, loss estimate, exposure value, or causal claim |
| Review operations lead | What historical workload and capture trade-off appears at 5%, 10%, 20%, 35%, or 50% capacity? | Held-out evaluation threshold table | Compare queue size, captured defaults, non-default reviews, precision, recall, and lift | Simulation is evaluated on 6,000 holdout rows, not a production queue |
| Risk governance reviewer | Does the model outperform simple baselines consistently, and where does the evidence stop being usable? | Frozen holdout, repeated development-split stability, paired uncertainty, calibration, robustness, ablations, lineage, and validation status | Assign a research-readiness verdict and document gaps | Single target horizon; no out-of-time or operational validation |
| Analyst | Why is a record inside or outside the selected simulated review set? | Out-of-fold score, score band, deterministic rank/denominator, selected capacity, historical outcome, and simulated placement | Inspect one bounded retrospective ranking result | Review placement is not an approval, denial, price, adverse-action reason, or recommendation |

## Information architecture

1. A compact product masthead states the research-only boundary, dataset, record count, and active evidence revision.
2. A persistent filter ribbon exposes score band, observed outcome, delinquency severity, limit range, payment-to-bill ratio, research-score range, and review capacity. The ribbon always reports the active cohort denominator and provides one reset action.
3. **Portfolio posture** leads with one primary observed-default signal, a supporting strip of portfolio magnitude and behavior metrics, and linked concentration visuals.
4. **Review planning** shows the evaluated capacity frontier and a scenario ledger. This section uses holdout evidence and is not altered by portfolio cohort filters.
5. **Cohort analysis** links repayment status, payment/bill profiles, distributions, and a score-band by delinquency matrix to the global filters.
6. **Model validation** is the Credit Risk Model Validation & Review-Capacity Lab. It begins with an explicit evidence-readiness verdict, then compares prevalence/random, repayment-rule, logistic, and candidate references; paired model deltas, split stability, calibration, capacity uncertainty, cohort robustness, feature-group ablations, freshness, data quality, and governance follow. Evidence absent from the governed artifact renders as unavailable rather than inferred.
7. **Record simulation** retains searchable, sortable, paginated governed rows but displays only academic source ID, retrospective out-of-fold score, score band, deterministic rank/denominator, selected capacity, historical outcome, and `Inside simulated review set` or `Outside simulated review set`. Aggregate portfolio and cohort analysis continues to use the full governed non-demographic artifact.

Navigation uses a compact top rail with five question-led views: Portfolio, Review planning, Cohorts, Model validation, and Record simulation. Desktop favors analytical density; tablet wraps two-column structures; mobile stacks sections, keeps filters usable, and converts wide tables to contained horizontal scrolling.

## Replacement visual direction

- **Character:** internal credit-risk validation workstation. It should feel operational, compact, sober, and specific to model review—not editorial, cinematic, lifestyle, or portfolio-marketing oriented.
- **Shell:** use a cool neutral application canvas, white or near-white data surfaces, charcoal text, and one muted navy/steel interaction color. Amber and red are reserved for warnings and limitations. Do not reuse cream paper, dark-teal accents, or warm editorial contrast.
- **Typography:** use one restrained UI sans-serif stack with medium and semibold hierarchy plus tabular figures for metrics. No display serif, oversized hero type, decorative tracking, or mixed editorial typography.
- **Hierarchy:** the product name is a compact utility header. Page titles are 20–28px functional labels such as `Model validation`, `Capacity analysis`, and `Record simulation`; never multi-line rhetorical questions. Remove ordinal eyebrows such as `04 / Model validation`.
- **Composition:** prefer continuous work surfaces, dense ledgers, comparison tables, aligned chart-and-table pairs, and one contextual detail rail. Do not arrange the page as equal bordered KPI cards or repeated explanation panels.
- **Content density:** keep definitions and limitations close to the relevant metric through concise inline notes, tooltips, or a stable context rail. Remove repeated `what this means / decision supported / limitation` triptychs and prose that restates the chart.
- **Navigation:** retain a compact top-level application navigation and filter workspace, but style it as product chrome rather than a magazine index. Active state must be obvious without an ornamental underline motif.
- **Shape and depth:** use square or 2–4px controls and subtle tonal grouping. Avoid uniform card radii, decorative shadows, paper rules, badges, and ornamental framing.
- **Responsive behavior:** mobile is a purpose-built review flow: summary first, then essential evidence, then a compact record list and inspector. Wide tables may scroll locally, but the viewport must not present a clipped desktop table as the primary experience.
- **Motion:** use only short state transitions for focus, hover, selection, loading, and disclosure. No entrance choreography, scroll reveals, parallax, or decorative motion.

### Explicitly prohibited visual fingerprints

- warm cream canvas plus Georgia/serif headlines plus teal accents;
- giant question-led hero headings and numbered eyebrow labels;
- a sea of equal bordered KPI cards;
- repeated `section label + serif heading + paragraph` panel headers;
- report-like full-page stacking where every evidence type becomes another card;
- generic generated-dashboard copy, ornamental status chips, and duplicated explanatory prose;
- using the rejected screenshots as a visual target.

## KPI glossary and presentation contract

Every KPI displays its filter context and exposes a plain-language definition, unit, denominator, source, interpretation, and limitation through visible supporting copy or a keyboard-accessible tooltip.

| KPI | Definition and unit | Source | Direction / interpretation | Limitation |
| --- | --- | --- | --- | --- |
| Records in view | Count of governed artifact rows after global filters | Analyst artifact | Cohort denominator | Academic sample, not a live portfolio |
| Observed defaults | Rows whose next-period source label equals 1; count and share of filtered rows | Analyst artifact | Historical outcome concentration | Retrospective label, not a forecast |
| Elevated-score records | Elevated + High score-band rows; count and share | Out-of-fold artifact scores | Larger share means more rows in upper research bands | Bands are research groupings, not policy thresholds |
| Reported credit limits | Sum, median, and mean of `LIMIT_BAL` | Analyst artifact | Describes reported limit distribution | Not balance, loss, exposure at default, or currency-normalized business exposure |
| Upper-band limit share | Share of summed `LIMIT_BAL` among Elevated + High rows | Analyst artifact | Concentration of reported limits in upper score bands | Must not be labeled financial exposure |
| Repayment delay | Rows outside `Current or paid`; severe delay is `Severe` | Derived artifact fields | Historical repayment-status concentration | Statement positions are not calendar dates |
| Payment-to-bill ratio | Median derived ratio; low-ratio share uses the documented 0.10 analytical cut | Derived artifact field | Descriptive repayment profile | Ratio is clipped in the artifact and is not affordability evidence |
| Review queue | Holdout sample size multiplied by selected evaluated capacity | Evaluation threshold table | Historical workload at capacity | Holdout simulation only |
| Captured defaults | Observed holdout defaults in the selected score-ranked set | Evaluation threshold table | Historical capture | No operational benefit or prevented-loss claim |
| Non-default reviews | Queue size minus captured defaults | Evaluation threshold table | Historical review burden | Not an adverse decision or false accusation |
| Precision | Captured defaults divided by reviewed rows | Evaluation threshold table | Yield among reviewed holdout rows | Threshold-specific retrospective estimate |
| Recall | Captured defaults divided by all observed holdout defaults | Evaluation threshold table | Share of observed defaults captured | Threshold-specific retrospective estimate |
| Lift vs random | Precision divided by holdout observed-default prevalence | Derived from evaluation evidence | Values above 1 indicate better historical concentration than random selection | Not a financial return metric |
| Incremental yield | Change in captured defaults divided by additional reviewed rows from the previous capacity step | Derived from evaluation thresholds | Marginal historical yield | Capacity steps are discrete and prespecified |
| Ranking / calibration | PR-AUC, AUROC, Brier, and 10-bin expected calibration error | Evaluation artifact | Higher PR-AUC/AUROC and lower Brier/ECE are preferable | Fixed holdout, not out-of-time evidence |
| Baseline-relative gain | Paired difference between a candidate and prevalence/random, logistic, or documented repayment-rule reference | Strengthened evaluation artifact | Shows whether complexity adds stable research value | Statistical uncertainty may support a tie rather than a winner |
| Split stability | Distribution of repeated development-fold metrics using identical folds across models | Strengthened evaluation artifact | Narrower variation supports reproducibility | Development evidence, not a replacement for the frozen holdout |
| Simulated review placement | Whether a record's out-of-fold score rank falls within the selected top-capacity share of the governed artifact | Analyst artifact plus selected capacity | Explains inclusion in a retrospective research review set | Not an approval, denial, price, adverse-action reason, or recommendation |

## Chart grammar

- Use native responsive SVG with one shared axis, label, tooltip, legend, and accessible-alternative pattern. Do not add a second charting vocabulary or decorative illustration.
- Chart titles are stakeholder questions. Subtitles name the data source and active filter context.
- Population is encoded by bar length or area; observed-default rate and research-score measures use position on a common percentage scale; reported limit uses currency-formatted position.
- Score bands always order Very low, Low, Moderate, Elevated, High. Delinquency always orders Current or paid, Delayed, Severe. Statement positions always retain `PAY_0, PAY_2...PAY_6` and explicitly say they are historical sequence positions, not dates.
- Selected marks use a heavy outline and text label. Hover and keyboard focus reveal the same value. Every chart has a `details`-based tabular alternative or adjacent data table.
- Zero baselines are mandatory for bars. Line charts show points and direct end labels. Calibration includes the ideal diagonal. Mixed-unit charts either separate panels or label independent scales explicitly.
- Empty filtered cohorts replace marks with an explanatory empty state. Missing evaluation arrays replace the visual with a governed unavailable state; the UI must never interpolate or invent values.

## Interaction contract

- Global filters cross-filter portfolio KPIs, cohort visuals, distributions, and record review. Evaluation-only review and model sections visibly state that they remain fixed to the held-out evaluation sample.
- Clicking a score-band bar, matrix cell, or distribution bin applies the corresponding supported filter. Active filters appear as removable text tokens with the remaining row count.
- Filter controls have explicit labels; range inputs show current numeric bounds; reset is disabled when no filter is active.
- Review capacity is restricted to verified 5%, 10%, 20%, 35%, and 50% points.
- Changing review capacity updates each record's deterministic simulated-review placement and visibly states the rank denominator. It must not imply that the model made a lending decision.
- Tables support source-ID search, sortable columns, 20-row pagination, visible sort direction, and keyboard-operable inspection.
- The inspector shows only the retrospective score, score band, deterministic rank/denominator, selected capacity, historical outcome, and simulated placement, and repeats: `Retrospective research simulation only — not an approval, denial, price, adverse-action reason, or lending recommendation.`

## Accessibility and states

- Target WCAG 2.2 AA contrast, keyboard access, logical heading order, visible focus rings, 44px touch targets on narrow screens, and a skip-to-content link.
- Charts use text labels, patterns/shape where useful, and tabular alternatives. Color is never the sole encoding.
- Loading uses a dashboard-shaped skeleton with status text. Empty filters preserve controls and explain how to reset. Invalid or absent artifacts fail closed and disclose that no records were exposed. A refusal state explains why protected-attribute or lending-decision analysis is unavailable and offers the permitted simulated-review placement instead.
- Live announcements report filter-result counts and record-inspector changes.
- Tooltips are accessible from hover and keyboard focus; essential definitions are never tooltip-only.

## Anti-slop and content rules

- No equal-card sea, marketing hero, glass, glow, decorative gradient, rainbow categorical palette, ornamental icon, fake trend arrow, synthetic production claim, or filler insight paragraph.
- Use plain business language first and technical names secondarily. Do not label reported limits as exposure, score as probability of a future customer outcome, review as an action recommendation, or historical statement positions as a time series.
- Never display sex, education, marriage, age, credentials, direct identifiers, model binaries, automated decisions, pricing, adverse-action language, forecasts, targets, losses, revenue, causal claims, or unverified benchmarks.
- Never label simulated review placement as `approved`, `denied`, `accepted`, `rejected`, `eligible`, `ineligible`, or `the model's decision`. A disclaimer does not cure decision language.
- Footer and governance panels retain UCI attribution, source and evaluation hashes, selected model, split limitation, immutable release context, and research-only status.

## Visual acceptance gate

Before public deployment, the strengthened evaluation artifacts, production build, repository tests, and `project-kit check` must pass; representative desktop (1440×1000), tablet (834×1112), and mobile (390×844) screenshots must show usable controls, evidence-readiness status, simulated-review placement, legible charts, chart alternatives, and no overflow of essential content. The owner must explicitly approve those screenshots and separately approve deployment. Local implementation does not grant deployment, merge, visibility, paid-resource, or rollback authority. The project-scoped Graphify refresh approved on 2026-08-10 is separate from deployment authority.
