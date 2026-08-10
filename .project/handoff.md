# Handoff

## Executive status

M0–M9 remain complete. M10's Credit Risk Model Validation & Review-Capacity Lab is implemented and fully verified locally on `feature/m10-bi-dashboard`. M10 remains `changes_requested` only because human visual approval has not yet been granted. The verified public M9 service is unchanged; no deployment, merge, publication, visibility, provider, billing, or rollback action occurred.

The immutable evaluated implementation revision is `543dc446c48b2cc2208f2e6362863563a0f7514d`. Final governance, screenshot, and Graphify evidence follows that candidate and is carried by the branch tip; it does not change the evaluated code.

## Governed evidence lineage

- Evaluation schema: `2`
- Evaluation generated UTC: `2026-08-10T07:27:21.801899+00:00`
- Evaluation SHA-256: `15f8b499c4978e061b96cc0b0cdfeac394cefde970373959ae625f07808ab83b`
- Analyst artifact schema: `4`
- Analyst artifact SHA-256: `06c3355aa09d3814dedb2660e5eec31db08e630971c524f529638b7beff8057a`
- Aggregate release schema: `2`
- Local aggregate release ID: `773e6f2a-9a8d-466b-90b2-22a823106288`
- Local aggregate release SHA-256: `9f9ae88536d3d5b9ca7fed988b90f4fb033fb608c0fcd6d3b44a34fefc0001bc`
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

The existing analyst-style rebuild was preserved and extended, not restarted. Model validation now leads with readiness, baselines, paired uncertainty, stability, calibration, robustness, feature-group reliance, freshness, supported uses, prohibited uses, and refusal behavior.

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

Production assets are 261.33 kB JavaScript / 78.47 kB gzip and 31.89 kB CSS / 6.88 kB gzip. This is a 2.18 kB (2.6%) combined-gzip increase over the verified visual rebuild and adds no runtime dependency. Local production preview measured 1 ms TTFB, 96 ms FCP, 196 ms LCP, and CLS 0.

Browser verification passed at 1440×1000, 834×1112, and 390×844 with no document-level overflow, console errors, or page errors. The automated WCAG A/AA audit reported zero violations and one incomplete contrast rule because sticky/overlapping elements obscured background detection.

Exact-lineage visual evidence:

- `docs/screenshots/m10/desktop-assurance.jpg`
- `docs/screenshots/m10/desktop-records.jpg`
- `docs/screenshots/m10/tablet-assurance.jpg`
- `docs/screenshots/m10/mobile-records.jpg`

## Graphify freshness

Graphify's local deterministic code-only update completed without transmitting repository content. It records 397 nodes, 684 edges, and 41 communities. The read-only multigraph diagnostic found zero missing/dangling endpoints, self-loops, exact duplicate edges, or directed/undirected endpoint collapse. `graphify-out/manifest.json` has SHA-256 `8219a20bbd2a3f8b89ec28e9b64e4fd61a6fdabc0e07426e0447c5ae2710c48d`, bound in `.project/graph-source.sha256`.

The approval reviewer blocked the Gemini semantic-doc refresh because it would transmit this private repository corpus to an external destination without a more payload-and-destination-specific approval. No workaround was attempted. Therefore the code graph is fresh, but final documentation semantics are not. Other disclosed limitations are one unverified node, one zero-node `project.json`, unavailable optional SQL extraction because `tree_sitter_sql` is not installed, nine communities renamed by their hub after the code update, and installed skill text `0.9.23` versus runtime `0.9.31`.

## Remaining limitations and next action

This is one historical academic population with one target horizon. There is no calendar-time, out-of-time, external, geographic, prospective, drift, operational, causal, loss, pricing, or lending-decision validation. Repeated folds are correlated views of the same development population. Capacity intervals describe the frozen audit sample, not staffing or business benefit. The approximately 15 MB governed data artifact remains the dominant transfer/load cost. Automated accessibility checks do not replace manual keyboard, zoom, screen-reader, and contrast review. Graphify's final documentation semantics remain pending a more specific external-transmission approval.

Next action is human review of the four refreshed screenshots and an explicit approve/changes-requested decision. Visual approval does not authorize deployment. Any deployment still requires a separate explicit approval and a matching green GitHub Actions quality run for the exact candidate revision.
