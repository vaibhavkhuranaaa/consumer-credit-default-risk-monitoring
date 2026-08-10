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
- [ ] Confirm `scripts/validate_public_artifact.py` passes and the version-4 artifact contains no demographic fields, local fairness evidence, forbidden decision fields, or incomplete deterministic ranks.
- [ ] Confirm the most recent GitHub Actions `quality` workflow for the same source revision is green.
- [ ] Confirm `.project/approvals.yml` still authorizes the effective non-demographic record and retrospective-score public scope. A new deployment needs explicit approval; this checklist does not grant it.
- [ ] Record the source revision, evaluation, aggregate, and analyst-artifact hashes, release ID, publisher identity, deployment URL, verification timestamp, and rollback target in `docs/RELEASE-LOG.md`.

## After an explicitly approved deployment

- [ ] Verify the deployment URL serves the expected release and analyst artifact version.
- [ ] Run `scripts/verify_live_release.py` with the exact approved release ID and full Git SHA; retain its pass result in the credential-free release record.
- [ ] Record the verification timestamp and the exact rollback target in the release log.
- [ ] Do not publish if the local gate or GitHub Actions quality run is not green.

## Current-release dry run

The current local artifact was built for a prior deployed revision, so use its recorded revision rather than `HEAD` for an audit-only dry run:

```sh
uv run python scripts/pre_release_gate.py \
  --allow-dirty \
  --revision 6e10495a76be508b1e912161397111b57612bae1 \
  --release-file artifacts/release.json
```

`--allow-dirty` is only for this documentation audit. It must not be used to publish a release.
