# Credit Risk Model Validation & Review-Capacity Lab

This project asks a narrower and more useful question than “how accurate is the model?”: does a non-demographic research model produce stable evidence beyond simple references, and what does a fixed review workload capture on a held-out historical sample?

The answer is deliberately bounded. On the frozen 6,000-row holdout, the selected model records PR-AUC `0.5764`, AUROC `0.7916`, Brier score `0.1314`, and 10-bin ECE `0.0124`. Repeated paired development tests support it over prevalence/random, a fixed repayment-delay rule, and logistic regression. Its advantage over calibrated Extra Trees does not clear the prespecified practical margin, so that comparison is reported as a tie.

The verified read-only lab is live at [consumer-credit-risk-workbench.pages.dev](https://consumer-credit-risk-workbench.pages.dev). It is a retrospective academic benchmark, not a lending system.

## The analytical problem

A single holdout score does not answer the questions a model reviewer actually has:

- Is the result stable across development splits?
- Is it meaningfully better than simple, documented references?
- How much uncertainty surrounds a fixed review workload?
- Is calibration acceptable, and where are the bins too sparse to trust?
- Does performance weaken in large non-demographic cohorts?
- Which feature groups does the fitted model rely on?
- Can an individual record be inspected without turning research evidence into a credit decision?

The lab makes those questions visible in one workflow and keeps four evidence populations separate: the frozen holdout, repeated development folds, the full licensed artifact, and live service health.

## Data and decision boundary

The source is the [UCI Default of Credit Card Clients dataset](https://archive.ics.uci.edu/dataset/350/default+of+credit+card+clients), licensed CC BY 4.0: 30,000 rows, 25 columns, no missing cells, and no duplicate source IDs in the acquired workbook.

Sex, education, marriage, and age are excluded from model inputs and public individual records. They remain local and appear only in the documented aggregate fairness audit. The public artifact contains licensed non-demographic research fields, deterministic derived measures, and retrospective out-of-fold scores.

At record level the interface shows only the academic source ID, retrospective out-of-fold score, score band, deterministic rank and denominator, selected capacity, historical outcome, and whether the row is inside or outside the simulated review set. It states:

> Retrospective research simulation only — not an approval, denial, price, adverse-action reason, or lending recommendation.

## Problem-solving approach

1. **Lock selection before the final audit.** Model and hyperparameter selection use the original 18,000-row train and 6,000-row validation sets. The 6,000-row holdout is frozen by its ID checksum and excluded from further selection.
2. **Test stability on development data.** Two repeats of three shared stratified folds compare all candidates on identical rows.
3. **Use a reference ladder.** Prevalence/random, logistic regression, and a fixed repayment-delay rule set a progressively stronger bar.
4. **Predefine what counts as resolved.** Paired 95% intervals must clear practical margins; otherwise the result is a tie.
5. **Put workload beside discrimination.** Five review-capacity points report queue composition, capture, precision, recall, lift, incremental yield, and 95% intervals.
6. **Look for weak spots.** Calibration slope/intercept, sparse bins, sample-size-aware cohort checks, and feature-group ablations qualify the headline metrics.
7. **Bind claims to lineage.** Evaluation schema, UTC generation time, source checksum, evaluated revision, split identities, command, tool versions, and artifact hashes travel with the release.

## What the evidence says

| Question | Result | Qualification |
| --- | --- | --- |
| Frozen-holdout ranking | PR-AUC `0.5764`; AUROC `0.7916` | Fixed stratified sample, not out-of-time validation |
| Probability quality | Brier `0.1314`; ECE `0.0124` | Calibration slope `1.0743`, intercept `0.0757`; the `0.8–0.9` bin has only 18 rows |
| Stability | Mean development PR-AUC `0.5513` across six paired folds | Repeated folds are correlated views of one historical population |
| Strongest model comparison | Extra Trees mean PR-AUC `0.5452`; selected-model delta `0.0061` (`0.0019–0.0109`) | Tie: the interval does not clear the `0.010` practical margin |
| 10% review capacity | 600 rows; 431 historical defaults; precision `0.7183`; recall `0.3248`; lift `3.2479` | Historical audit-sample estimate, not staffing or benefit forecast |
| Largest ablation loss | Repayment-status group: PR-AUC loss `0.0982` (`0.0845–0.1141`) | Model-reliance evidence only, never a cause or consumer explanation |

The readiness verdict is: **usable for retrospective research simulation; not validated for lending use**.

## Design approach

The interface is shaped as an internal validation workstation, not a marketing dashboard. Compact navigation keeps portfolio posture, review capacity, cohort checks, model validation, data quality, and record simulation close together. Comparisons use aligned evidence ledgers rather than repeated cards. Definitions and limitations appear progressively, while chart data remains available in semantic tables.

The mobile record view is its own review composition rather than a clipped desktop table. Keyboard controls, visible focus, loading, empty, error, unavailable, and refusal states are part of the product contract. Native SVG and semantic HTML avoid a chart-library dependency.

## System outline

```text
checksum-pinned UCI workbook
  → schema and range validation
  → locked selection + frozen holdout + repeated development evaluation
  → versioned evaluation and release artifacts
  → 30,000-row non-demographic analyst artifact
  → React validation workstation on Cloudflare Pages
  → read-only release and health functions backed by Neon
```

The production path uses Cloudflare Pages/Workers Free and Neon Free. It accepts no viewer writes and adds no visitor analytics or scheduled monitoring. The exact deployed application revision is `d3e5b103b63a8e222d36084c85eed302f6b35398`; live verification completed at `2026-08-10T14:53:18Z`.

## Reproduce and verify

Prerequisites are Python 3.11+, `uv`, Node.js, and pnpm. The checksum-pinned source workbook stays under ignored `data/raw/`.

```bash
uv sync
uv run python scripts/run_evaluation.py
uv run python scripts/build_release.py --revision <immutable-git-sha>
uv run python scripts/build_public_dataset.py
uv run pytest -q

cd web
pnpm lint
pnpm test
pnpm build
```

Before any separately approved release, run the full gate in [docs/RELEASE-CHECKLIST.md](docs/RELEASE-CHECKLIST.md). The evaluation contract is in [.project/evaluation.md](.project/evaluation.md), metric definitions are in [docs/metric-glossary.md](docs/metric-glossary.md), and the complete evidence-backed narrative is in [CASE-STUDY.md](CASE-STUDY.md).

## Limits

This is one historical academic population with one target horizon. It has no calendar-time, external, geographic, prospective, drift, operational, causal, loss, pricing, or lending-decision validation. The public app is a research and portfolio demonstration; it is not a production credit service.
