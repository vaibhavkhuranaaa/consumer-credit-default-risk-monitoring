# Pre-release checklist

Use this checklist for every public release. It is a local control only; do not put credentials, raw data, individual records, protected-attribute values, predictions, or model binaries in this file or the release log.

## Before publishing

- [ ] Worktree is clean and the source revision is an immutable commit SHA.
- [ ] Run the local gate with the artifact's exact revision:

  ```sh
  uv run python scripts/pre_release_gate.py \
    --revision "$(git rev-parse HEAD)" \
    --release-file artifacts/release.json
  ```

- [ ] Record the SHA-256 hash of `artifacts/evaluation.json`, the gate-validated `artifacts/release.json`, and `web/public/data/uci-credit-records.json`.
- [ ] Confirm the most recent GitHub Actions `quality` workflow for the same source revision is green.
- [ ] Confirm `.project/approvals.yml` still authorizes the aggregate-only public release. A new deployment needs explicit approval; this checklist does not grant it.
- [ ] Record the source revision, evaluation, aggregate, and full-record-artifact hashes, release ID, publisher identity, deployment URL, verification timestamp, and rollback target in `docs/RELEASE-LOG.md`.

## After an explicitly approved deployment

- [ ] Verify the deployment URL serves the expected aggregate-only release.
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
