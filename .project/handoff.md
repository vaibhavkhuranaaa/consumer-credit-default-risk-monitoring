# Handoff

## Executive status

M0–M10 are complete. Owner-approved M10 application revision `d3e5b103b63a8e222d36084c85eed302f6b35398` and release `f7c0c305-caf8-4003-9f1b-4aeacb37ec63` are live and verified at `https://consumer-credit-risk-workbench.pages.dev`. The rejected earlier candidate remains historical evidence only. No merge, visibility, provider, billing, rollback, teardown, scheduled monitoring, or custom-domain action occurred.

The immutable evaluated and deployed application revision is `d3e5b103b63a8e222d36084c85eed302f6b35398`. Deployment approval and final credential-free publication records follow that candidate on the branch tip; they do not change the evaluated application.

## Governed evidence lineage

- Evaluation schema: `2`
- Evaluation generated UTC: `2026-08-10T14:20:10.827594+00:00`
- Evaluation SHA-256: `4d284b8f47fcf32ee599e1652a0ac0d09914784a5e5fd69f7fae8d6283c35fff`
- Analyst artifact schema: `4`
- Analyst artifact SHA-256: `fb9ba15d059471904c8b982243aee6d36e69eb982b98a861b5b1b8478ec0247b`
- Aggregate release schema: `2`
- Published aggregate release ID: `f7c0c305-caf8-4003-9f1b-4aeacb37ec63`
- Published aggregate release SHA-256: `346e5e1687d7803a0f38b6656cd11f05ba2130fed80701f5d9630564733b8c71`
- Frozen holdout: 6,000 rows; ID SHA-256 `df4a7f48dc14f491d592e858e1b128cb975ad83e1281de330876eb307cef2215`
- Source archive SHA-256: `30c6be3abd8dcfd3e6096c828bad8c2f011238620f5369220bd60cfc82700933`
- Evaluation command: `uv run python scripts/run_evaluation.py --revision d3e5b103b63a8e222d36084c85eed302f6b35398`

## Evaluation judgment

The validation-locked calibrated histogram gradient-boosting model retains frozen-holdout PR-AUC `0.5764`, AUROC `0.7916`, Brier `0.1314`, and 10-bin ECE `0.0124`.

Repeated development evidence uses two repeats of three shared stratified folds over the 24,000 development rows. Mean PR-AUC is `0.5513`, versus prevalence/random `0.2212`, repayment-delay rule `0.4480`, logistic `0.5006`, and calibrated Extra Trees `0.5452`. Paired evidence supports superiority over the first three references. The Extra Trees PR-AUC delta is `0.0061` with paired 95% interval `0.0019–0.0109`; it does not clear the prespecified `0.010` practical margin, so the verdict is **tie**.

At 10% holdout capacity, 600 rows include 431 observed defaults and 169 observed non-defaults. Precision is `0.7183` (`0.6867–0.7533`), recall `0.3248` (`0.3088–0.3434`), and lift `3.2479` (`3.0880–3.4344`). All five approved capacity points include uncertainty for capture, non-default reviews, precision, recall, lift, and incremental yield.

Calibration slope is `1.0743` and intercept `0.0757`; the 0.8–0.9 bin is sparse (`n=18`). The Severe delinquency cohort is limited (`n=86`). The Higher payment-to-bill cohort records PR-AUC `0.3084` (`0.2536–0.3643`). Repayment-status ablation has the largest PR-AUC loss, `0.0982` (`0.0845–0.1141`). Cohort and ablation results are robustness/model-reliance evidence only, never causal or adverse-action explanations.

Readiness remains: **usable for retrospective research simulation; not validated for lending use**.

## Product and record boundary

The existing analyst-style rebuild was preserved and refactored, not restarted. The replacement uses a cool-neutral shell, Aptos/Segoe UI system typography, compact functional titles, aligned tabular metrics, continuous comparison ledgers, progressive metric context, and a purpose-built mobile record list. It removes the rejected warm cream/serif/teal language, rhetorical question hierarchy, ordinal eyebrows, repeated visible explanation triptychs, and desktop-table-first mobile composition.

Record simulation shows only academic source ID, retrospective out-of-fold score, score band, deterministic rank/denominator, selected capacity, historical outcome, and `Inside simulated review set` or `Outside simulated review set`. It displays exactly: `Retrospective research simulation only — not an approval, denial, price, adverse-action reason, or lending recommendation.` Lending-decision, eligibility, pricing, adverse-action, recommendation, and “the model decided” language is refused.

Sex, education, marriage, and age remain excluded from model inputs and public individual records. Aggregate fairness remains local and is removed from analyst and aggregate-release payloads. The public product remains read-only and governed by existing availability behavior.

## Verification evidence

The credential-free pre-release gate passed from exact deployed candidate `d3e5b103b63a8e222d36084c85eed302f6b35398`:

- evaluation regeneration and governed artifact validation;
- 19 Python tests;
- TypeScript lint;
- 15 web tests;
- production build;
- `project-kit check`.

Production assets are 260.83 kB JavaScript / 78.05 kB gzip and 31.39 kB CSS / 6.66 kB gzip. This is 0.64 kB smaller combined gzip than the rejected candidate and adds no runtime dependency. Local preview measured 1.5 ms TTFB, 88 ms FCP, 188 ms LCP, and CLS 0.

Browser verification passed at 1440×1000, 834×1112, and 390×844 with no document-level overflow, console errors, or page errors. The automated WCAG A/AA audit reported zero violations and one incomplete contrast rule because sticky/overlapping elements obscured background detection.

Deployment-readiness cleanup and publication were separately owner-approved. Exact candidate `d3e5b103b63a8e222d36084c85eed302f6b35398` passed 19 Python tests, TypeScript lint, 15 web tests, production build, `project-kit check`, and matching GitHub quality run `31397767371`. Cloudflare deployment `bfd5f35a-86b2-40cb-b260-4f8967703236` passed live availability, security-header, cache, exact lineage, 30,000-row artifact, and demographic-exclusion verification at `2026-08-10T14:53:18Z`. The one-use local publisher credential handoff file was deleted immediately after publication.

Replacement visual evidence for owner review:

- `docs/screenshots/m10/desktop-validation-workstation.png`
- `docs/screenshots/m10/desktop-record-review.png`
- `docs/screenshots/m10/tablet-validation-workstation.png`
- `docs/screenshots/m10/mobile-record-review.png`

Rejected historical visual evidence, retained only as history:

- `docs/screenshots/m10/desktop-assurance.jpg`
- `docs/screenshots/m10/desktop-records.jpg`
- `docs/screenshots/m10/tablet-assurance.jpg`
- `docs/screenshots/m10/mobile-records.jpg`

## Graphify freshness

Graphify's last local deterministic code-only update completed after the corrective implementation without transmitting repository content. It records 397 nodes, 662 edges, and 43 communities. The read-only multigraph diagnostic found zero missing/dangling endpoints, self-loops, exact duplicate edges, or directed/undirected endpoint collapse. `graphify-out/manifest.json` has SHA-256 `75a64110abbbaa370fa55ce77dd170c76f257c0d09475e3845e5d1cb5933cf26`, bound in `.project/graph-source.sha256`. It predates the deployment-readiness gate/test and these final publication records.

The approval reviewer blocked the Gemini semantic-doc refresh because it would transmit this private repository corpus to an external destination without a more payload-and-destination-specific approval. No workaround was attempted. Therefore the graph remains valid for the approved visual implementation but is not exact for the later release-control and publication-record changes. Other disclosed limitations are one unverified node, one zero-node `project.json`, unavailable optional SQL extraction because `tree_sitter_sql` is not installed, 25 communities renamed by their hub after the code update, and installed skill text `0.9.23` versus runtime `0.9.31`.

## Remaining limitations and next action

This is one historical academic population with one target horizon. There is no calendar-time, out-of-time, external, geographic, prospective, drift, operational, causal, loss, pricing, or lending-decision validation. Repeated folds are correlated views of the same development population. Capacity intervals describe the frozen audit sample, not staffing or business benefit. The approximately 15 MB governed data artifact remains the dominant transfer/load cost. Automated accessibility checks do not replace manual keyboard, zoom, screen-reader, and contrast review. GitHub quality is green, but third-party Actions emit non-blocking Node.js 20 deprecation warnings. Graphify's final documentation semantics remain pending a more specific external-transmission approval.

Next action is M11: package the verified portfolio case study from the deployed M10 evidence. Do not change the verified deployment or publish the case study without new approval.
