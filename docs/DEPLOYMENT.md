# Public showcase deployment runbook

## Boundary

The public site is a read-only academic analyst demonstration. Licensed non-demographic UCI fields, deterministic derived measures, and explicitly approved retrospective research scores may be published. Demographic fields remain local and are used only in aggregate fairness diagnostics. Credentials, model binaries, and approval/denial/pricing recommendations must never leave the local evaluation environment.

For a local dashboard preview, `pnpm dev` serves `artifacts/release.json` at the read-only release endpoint and the generated `web/public/data/analyst-workspace.json` artifact as static data. The analyst artifact is built from the checksum-pinned UCI workbook by the pre-release gate. Vite never uses Neon credentials. If the aggregate artifact is absent, the API endpoint fails closed with `503`.

## Architecture

Cloudflare Pages serves the React/Vite application. Pages Functions exposes only the current approved aggregate release through `/api/v1/releases/current`. The Function has a Neon `portfolio_api` credential restricted to `SELECT` on `public_release_snapshot`. A local publisher uses the separate `portfolio_publisher` credential to write a validated release.

## First release checklist

1. Record approval for the private GitHub repository, Neon Free project, Cloudflare Pages project, and public analyst-product scope in `.project/approvals.yml`.
2. Create Neon roles `portfolio_api` and `portfolio_publisher`, apply `db/migrations/001_release_evidence.sql`, and set a Neon branch aside for migration validation.
3. Run `uv sync`, `uv run python scripts/run_evaluation.py`, and `uv run python scripts/build_release.py --revision <immutable-git-sha>` locally.
4. From a clean worktree, run the required local gate with that exact immutable SHA: `uv run python scripts/pre_release_gate.py --revision <immutable-git-sha> --release-file artifacts/release.json`. It validates the aggregate artifact, rebuilds and validates the non-demographic analyst artifact from the checksum-pinned workbook, then runs Python tests, web lint/tests/build, and project records.
5. Confirm the GitHub Actions `quality` workflow is green for the same source SHA, then complete `docs/RELEASE-CHECKLIST.md` and append the required credential-free lineage record to `docs/RELEASE-LOG.md`.
6. Set `NEON_PUBLISHER_DATABASE_URL` only in the publisher shell, then run `uv run python scripts/publish_release.py`.
7. Build `web` with `pnpm build`, then deploy `web/dist` directly to the approved Cloudflare Pages project. Configure only `NEON_API_DATABASE_URL` and `ALLOWED_ORIGIN` as Cloudflare secrets. The `wrangler.jsonc` contract enables bounded native logs/traces; it creates no scheduled job or third-party monitor.
8. Run the exact live verification command in `docs/AVAILABILITY-RUNBOOK.md`. Treat any security-header, cache, release-lineage, health, row-count, or protected-field failure as a failed deployment.

The current private GitHub Free repository cannot enforce required branch protection; do not make it public or add billing without a new recorded approval. The mandatory compensating control is the passing local gate plus a green GitHub Actions quality run before deployment. Git-connected pull-request previews are not configured.

## Rollback and teardown

Cloudflare deployment rollback changes only static application code; it never changes release history. Follow `docs/AVAILABILITY-RUNBOOK.md` to identify the last verified deployment and obtain explicit approval before rollback. To change displayed evidence, publish a new validated release and advance `current_release`. To tear down, remove Cloudflare secrets, delete the Pages project, revoke Neon roles/credentials, and retain the local source and provenance records.

## Cost guardrails

Use Cloudflare Free and Neon Free only. Do not attach a payment method, custom domain, paid Worker plan, storage bucket, scheduled job, or always-on database setting without a new recorded approval. The public Function is cacheable for one hour and has no write route.
