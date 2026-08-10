# Handoff

## Current release

The deployed workspace is the prior full-record explorer at https://consumer-credit-default-risk-monitoring.pages.dev. The local successor is a validated retrospective analyst simulation with executive overview, workbench, and model lab; it has not been deployed by this change.

## Next action

M9 is locally implemented but not production-verified. Project-owner deployment approval was recorded on 2026-08-09. Refresh graph freshness, commit the intended revision, generate the matching evaluation/release/analyst artifacts, pass `scripts/pre_release_gate.py` from a clean worktree and the matching GitHub Actions `quality` run, deploy, then run `scripts/verify_live_release.py`. Only then mark M9 complete.

Graph freshness remains pending. No transmission occurred: the external-policy reviewer requires an approval that explicitly names transmission of repository source and governance content to the configured Gemini-backed Graphify semantic service.

## Release-control evidence

`docs/RELEASE-CHECKLIST.md` defines the required local and GitHub Actions checks. `docs/RELEASE-LOG.md` retains the historical aggregate-only release at source revision `6e10495a76be508b1e912161397111b57612bae1` and artifact SHA-256 `177f36810238cdeed7a9f9d6b1ae73dde41170dad3d45b9d27b257d679a764ee`. The M7 audit-mode gate passed on `2026-08-05T04:17:57Z`; it did not deploy, publish, or alter provider resources.

The current full-record deployment is release `4cd50ffb-5cae-4812-aaad-f7631821feb1`, source revision `b02193103a17bdc9e14158aecec10d9aba11cc08`, and verified at `2026-08-05T04:55:52Z` after local-gate and GitHub Actions quality pass.

## Safety boundary

Do not change repository visibility, add paid services, or make a credit decision claim. The raw workbook and demographic fields remain local and ignored by Git; `scripts/build_public_dataset.py` generates the separately ignored, non-demographic deployment artifact.
