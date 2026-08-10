# Handoff

## Executive status

M0–M10 are complete. The owner approved corrected visual candidate `a92a913573f7352bb95640c9c3ce368468bbe5b3` on 2026-08-10. The rejected earlier candidate remains historical evidence only. The verified public M9 service is unchanged; no M10 deployment, merge, publication, visibility, provider, billing, or rollback action occurred.

The immutable evaluated implementation revision is `543dc446c48b2cc2208f2e6362863563a0f7514d`. Final governance, screenshot, and Graphify evidence follows that candidate and is carried by the branch tip; it does not change the evaluated code.

## Governed evidence lineage

- Evaluation schema: `2`
- Evaluation generated UTC: `2026-08-10T13:39:08.437643+00:00`
- Evaluation SHA-256: `89e518d29368cced94a64f8261ee51ba74647f676c3717a499007a081fb37063`
- Analyst artifact schema: `4`
- Analyst artifact SHA-256: `2107393a06617da72bb388837cb3464e3701dc9fd7d94873d190ee3ce607ff19`
- Aggregate release schema: `2`
- Local aggregate release ID: `af219ccd-7018-4666-8867-6c5ef239e129`
- Local aggregate release SHA-256: `b70ac6299eaad91658ab61ea12e3cf3c277655cf5d01280a016f4f5a4d233e84`
- Frozen holdout: 6,000 rows; ID SHA-256 `df4a7f48dc14f491d592e858e1b128cb975ad83e1281de330876eb307cef2215`
- Source archive SHA-256: `30c6be3abd8dcfd3e6096c828bad8c2f011238620f5369220bd60cfc82700933`
- Evaluation command: `uv run python scripts/run_evaluation.py --revision 543dc446c48b2cc2208f2e6362863563a0f7514d`

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

The credential-free pre-release gate passed from candidate `543dc446c48b2cc2208f2e6362863563a0f7514d`:

- evaluation regeneration and governed artifact validation;
- 17 Python tests;
- TypeScript lint;
- 15 web tests;
- production build;
- `project-kit check`.

Production assets are 260.83 kB JavaScript / 78.05 kB gzip and 31.39 kB CSS / 6.66 kB gzip. This is 0.64 kB smaller combined gzip than the rejected candidate and adds no runtime dependency. Local preview measured 1.5 ms TTFB, 88 ms FCP, 188 ms LCP, and CLS 0.

Browser verification passed at 1440×1000, 834×1112, and 390×844 with no document-level overflow, console errors, or page errors. The automated WCAG A/AA audit reported zero violations and one incomplete contrast rule because sticky/overlapping elements obscured background detection.

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

Graphify's local deterministic code-only update completed after the corrective implementation without transmitting repository content. It records 397 nodes, 662 edges, and 43 communities. The read-only multigraph diagnostic found zero missing/dangling endpoints, self-loops, exact duplicate edges, or directed/undirected endpoint collapse. `graphify-out/manifest.json` has SHA-256 `75a64110abbbaa370fa55ce77dd170c76f257c0d09475e3845e5d1cb5933cf26`, bound in `.project/graph-source.sha256`.

The approval reviewer blocked the Gemini semantic-doc refresh because it would transmit this private repository corpus to an external destination without a more payload-and-destination-specific approval. No workaround was attempted. Therefore the code graph is fresh, but final documentation semantics are not. Other disclosed limitations are one unverified node, one zero-node `project.json`, unavailable optional SQL extraction because `tree_sitter_sql` is not installed, 25 communities renamed by their hub after the code update, and installed skill text `0.9.23` versus runtime `0.9.31`.

## Remaining limitations and next action

This is one historical academic population with one target horizon. There is no calendar-time, out-of-time, external, geographic, prospective, drift, operational, causal, loss, pricing, or lending-decision validation. Repeated folds are correlated views of the same development population. Capacity intervals describe the frozen audit sample, not staffing or business benefit. The approximately 15 MB governed data artifact remains the dominant transfer/load cost. Automated accessibility checks do not replace manual keyboard, zoom, screen-reader, and contrast review. Graphify's final documentation semantics remain pending a more specific external-transmission approval.

Next action is M11: package the verified portfolio case study using the approved visual candidate and existing governed evidence. Visual approval does not authorize deployment; any deployment still requires a separate explicit approval and a matching green GitHub Actions quality run for the future exact candidate revision.
