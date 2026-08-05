# Handoff

## Current release

The full-record analyst workspace is live at https://consumer-credit-default-risk-monitoring.pages.dev. It serves the approved UCI source-record artifact and remains read-only with no automated lending decision.

## Next action

M8 is complete. M9 is unblocked but must not begin without a separate request. GitHub-required branch protection cannot be enabled for this private repository on the current plan; require both `scripts/pre_release_gate.py` from a clean worktree and a green GitHub Actions `quality` run for the same commit before deployment.

## Release-control evidence

`docs/RELEASE-CHECKLIST.md` defines the required local and GitHub Actions checks. `docs/RELEASE-LOG.md` retains the historical aggregate-only release at source revision `6e10495a76be508b1e912161397111b57612bae1` and artifact SHA-256 `177f36810238cdeed7a9f9d6b1ae73dde41170dad3d45b9d27b257d679a764ee`. The M7 audit-mode gate passed on `2026-08-05T04:17:57Z`; it did not deploy, publish, or alter provider resources.

The current full-record deployment is release `4cd50ffb-5cae-4812-aaad-f7631821feb1`, source revision `b02193103a17bdc9e14158aecec10d9aba11cc08`, and verified at `2026-08-05T04:55:52Z` after local-gate and GitHub Actions quality pass.

## Safety boundary

Do not change repository visibility, add paid services, or make a credit decision claim. The raw workbook remains local and ignored by Git; `scripts/build_public_dataset.py` generates the separately ignored, approved full-record deployment artifact.
