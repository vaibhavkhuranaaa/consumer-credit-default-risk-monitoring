# Handoff

## Current release

The public showcase at https://consumer-credit-default-risk-monitoring.pages.dev remains the historical aggregate-only deployment. A full-record replacement is approved and built locally, but not yet deployed.

## Next action

M8 is in progress under the recorded owner approval for a full-record public analyst workspace. GitHub-required branch protection cannot be enabled for this private repository on the current plan; require both `scripts/pre_release_gate.py` from a clean worktree and a green GitHub Actions `quality` run for the same commit before deployment.

## Release-control evidence

`docs/RELEASE-CHECKLIST.md` defines the required local and GitHub Actions checks. `docs/RELEASE-LOG.md` traces the current public release to source revision `6e10495a76be508b1e912161397111b57612bae1` and artifact SHA-256 `177f36810238cdeed7a9f9d6b1ae73dde41170dad3d45b9d27b257d679a764ee`. The M7 audit-mode gate passed on `2026-08-05T04:17:57Z`; it did not deploy, publish, or alter provider resources.

## Safety boundary

Do not change repository visibility, add paid services, or make a credit decision claim. The raw workbook remains local and ignored by Git; `scripts/build_public_dataset.py` generates the separately ignored, approved full-record deployment artifact.
