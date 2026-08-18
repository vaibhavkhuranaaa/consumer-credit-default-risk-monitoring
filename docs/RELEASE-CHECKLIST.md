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

  For an explicitly approved application-only deployment that preserves the immutable model release, add `--application-only`. This validates the existing release and governed artifact without regenerating evaluation evidence.

- [ ] Record the SHA-256 hash of `artifacts/evaluation.json`, the gate-validated `artifacts/release.json`, and `web/public/data/analyst-workspace.json`.
- [ ] Confirm `web/public/data/` contains only `analyst-workspace.json`; the gate rejects obsolete or unexpected payloads before building `web/dist`.
- [ ] Confirm the production build generated `web/dist/source.json` with the exact sanitized candidate SHA and removed historical revision identifiers from the analyst artifact.
- [ ] Confirm `scripts/validate_public_artifact.py` passes and the version-4 artifact contains no demographic fields, local fairness evidence, forbidden decision fields, or incomplete deterministic ranks.
- [ ] Confirm the most recent GitHub Actions `quality` workflow for the same source revision is green.
- [ ] Confirm every superseded public deployment redirects to the canonical deployment or returns `404`/`410`; the live verifier treats a reachable legacy record surface as blocking.
- [ ] Confirm the private ops approval record still authorizes the effective non-demographic record and retrospective-score public scope. A new deployment needs explicit approval; this checklist does not grant it.
- [ ] Record the source revision, evaluation, aggregate, and analyst-artifact hashes, release ID, publisher identity, deployment URL, verification timestamp, and rollback target in `docs/RELEASE-LOG.md`.

## After an explicitly approved deployment

- [ ] Verify the deployment URL serves the expected release, analyst artifact version, and exact sanitized candidate SHA in `/source.json`.
- [ ] Run `scripts/verify_live_release.py --expected-release-id <release-id> --expected-source-sha <candidate-sha>`; retain its pass result in the credential-free release record.
- [ ] Record the verification timestamp and the exact rollback target in the release log.
- [ ] Do not publish if the local gate or GitHub Actions quality run is not green.

## Candidate boundary

The gate must run from a clean worktree against the exact immutable candidate SHA. `--allow-dirty` remains available only for explicitly documented audits and must never support publication or deployment.
