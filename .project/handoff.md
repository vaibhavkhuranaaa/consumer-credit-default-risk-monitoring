# Handoff

## Status

M0–M11 are complete. The verified public product remains application revision `d3e5b103b63a8e222d36084c85eed302f6b35398`, immutable release `f7c0c305-caf8-4003-9f1b-4aeacb37ec63`, and Cloudflare deployment `bfd5f35a-86b2-40cb-b260-4f8967703236` at `https://consumer-credit-risk-workbench.pages.dev`.

M11 changes documentation and publication-source contracts only. It does not change the application, evaluation, public artifact, API, database, or deployed release.

## M11 deliverables

- `README.md`: analytical project document covering the problem, decision boundary, method, evidence, design, architecture, reproduction, and limitations.
- `CASE-STUDY.md`: final evidence-backed case study with exact model, capacity, calibration, reliability, privacy, accessibility, performance, and lineage qualifications.
- `portfolio/project.json`: v2 publication-profile manifest with the case-study story, presentation metadata, evidence records, and four resume bullet candidates.
- `portfolio/release.json`: disabled release contract. Public portfolio admission remains impossible until separately approved.
- Isolated portfolio proof: v2 publication validation, four-bullet resume projection, and the Next production export for `/projects/consumer-credit-default-risk-monitoring` pass. The portfolio platform's formal preview path still excludes preview-status entries from static route generation; the renderer proof promoted status only inside a disposable build directory.
- Four approved presentation captures under `docs/screenshots/m10/`; all superseded captures were deleted.
- Agent-specific files are local and ignored rather than tracked as project content.
- Retired GitHub draft PR #1 and branch `release/m9-availability-hardening` were deleted.

## Graph freshness

The final local structural Graphify rebuild records 347 nodes, 643 edges, and 24 reviewed communities. All deleted JPG nodes are gone. `graphify-out/manifest.json` hashes to `62db33ee57d4f2e8c2fbb90bcb8bce28c877fcc365c80b0d41871fc5a5825185`, recorded in `.project/graph-source.sha256`.

No repository content was transmitted. The graph is exact for supported structural extraction, not for document/image semantics. Two JSON contracts produce zero structural nodes, optional SQL parsing is unavailable, 81 nodes have at most one connection, and the pre-build diagnostic reports 102 dangling references plus 30 same-endpoint collapse cases even though the built graph remains usable. These are tool/extraction limits, not verified application defects.

## Evidence lineage

- Evaluated and deployed application revision: `d3e5b103b63a8e222d36084c85eed302f6b35398`
- Evaluation generated UTC: `2026-08-10T14:20:10.827594+00:00`
- Evaluation SHA-256: `4d284b8f47fcf32ee599e1652a0ac0d09914784a5e5fd69f7fae8d6283c35fff`
- Frozen holdout: 6,000 rows; ID SHA-256 `df4a7f48dc14f491d592e858e1b128cb975ad83e1281de330876eb307cef2215`
- Analyst artifact schema/hash: v4 / `fb9ba15d059471904c8b982243aee6d36e69eb982b98a861b5b1b8478ec0247b`
- Aggregate release schema/hash: v2 / `346e5e1687d7803a0f38b6656cd11f05ba2130fed80701f5d9630564733b8c71`
- GitHub quality run for the deployed candidate: `31397767371`

## Final judgment

Frozen-holdout PR-AUC is `0.5764`, AUROC `0.7916`, Brier `0.1314`, and ECE `0.0124`. Repeated development evidence clears prevalence/random, the repayment-delay rule, and logistic regression. The selected-model PR-AUC delta over Extra Trees is `0.0061` (`0.0019–0.0109`) and does not clear the `0.010` practical margin, so the verdict is a tie.

At 10% holdout capacity, 600 rows include 431 observed defaults and 169 observed non-defaults. Precision is `0.7183`, recall `0.3248`, and lift `3.2479`, all with 95% intervals. These are historical audit-sample estimates, not staffing or benefit forecasts.

Readiness remains: **usable for retrospective research simulation; not validated for lending use**.

## Boundaries

Record simulation is limited to academic source ID, retrospective out-of-fold score, score band, deterministic rank/denominator, selected capacity, historical outcome, and `Inside simulated review set` or `Outside simulated review set`. The mandatory statement remains:

`Retrospective research simulation only — not an approval, denial, price, adverse-action reason, or lending recommendation.`

Sex, education, marriage, and age remain excluded from model inputs and public individual records. Aggregate fairness remains local and is stripped from public payloads.

## Next action

M12 is next and requires approval before any rollback or teardown rehearsal. Separately, publishing the M11 case study requires approval to align the private repository’s default branch with the live source revision and admit the manifest to the portfolio registry. No merge, visibility change, product redeployment, publication, rollback, teardown, or paid-resource action is implied by this handoff.
