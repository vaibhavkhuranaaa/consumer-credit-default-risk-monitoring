# Pre-release checklist

Use this checklist for every public release. It is a local control only; do not put credentials, model binaries, or lending recommendations in this file or the release log. Approved source records and retrospective research-score artifact hashes may be recorded.

## Before publishing

- [ ] Worktree is clean and the source revision is an immutable commit SHA.
- [ ] Run the local gate with the artifact's exact revision:

  ```sh
  uv run python scripts/pre_release_gate.py \
    --revision "$(git rev-parse HEAD)" \
    --release-file artifacts/release.json
  ```

- [ ] Record the SHA-256 hash of `artifacts/evaluation.json`, the gate-validated `artifacts/release.json`, and `web/public/data/analyst-workspace.json`.
- [ ] Confirm `web/public/data/` contains only `analyst-workspace.json`; the gate rejects obsolete or unexpected payloads before building `web/dist`.
- [ ] After the production build, generate `web/dist/source.json` with `scripts/write_deployment_source.py` and the exact default-branch SHA. Do not use the evaluated model revision when the application revision has advanced.
- [ ] Confirm `scripts/validate_public_artifact.py` passes and the version-4 artifact contains no demographic fields, local fairness evidence, forbidden decision fields, or incomplete deterministic ranks.
- [ ] Confirm the most recent GitHub Actions `quality` workflow for the same source revision is green.
- [ ] Confirm `.project/approvals.yml` still authorizes the effective non-demographic record and retrospective-score public scope. A new deployment needs explicit approval; this checklist does not grant it.
- [ ] Record the source revision, evaluation, aggregate, and analyst-artifact hashes, release ID, publisher identity, deployment URL, verification timestamp, and rollback target in `docs/RELEASE-LOG.md`.

## After an explicitly approved deployment

- [ ] Verify the deployment URL serves the expected release, analyst artifact version, and exact application revision at `/source.json`.
- [ ] Run `scripts/verify_live_release.py` with the exact approved release ID, evaluated release SHA, and deployed source SHA; retain its pass result in the credential-free release record.
- [ ] Record the verification timestamp and the exact rollback target in the release log.
- [ ] Do not publish if the local gate or GitHub Actions quality run is not green.

## Candidate boundary

The gate must run from a clean worktree against the exact immutable candidate SHA. `--allow-dirty` remains available only for explicitly documented audits and must never support publication or deployment.
