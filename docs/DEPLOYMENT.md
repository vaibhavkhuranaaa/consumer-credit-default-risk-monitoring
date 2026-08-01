# Public showcase deployment runbook

## Boundary

The public site is a read-only, aggregate-only portfolio demonstration. Raw UCI data, individual rows, demographic values, predictions, model binaries, and publisher credentials must never leave the local evaluation environment.

## Architecture

Cloudflare Pages serves the React/Vite application. Pages Functions exposes only the current approved aggregate release through `/api/v1/releases/current`. The Function has a Neon `portfolio_api` credential restricted to `SELECT` on `public_release_snapshot`. A local publisher uses the separate `portfolio_publisher` credential to write a validated release.

## First release checklist

1. Record approval for the private GitHub repository, Neon Free project, Cloudflare Pages project, and public aggregate-only release in `.project/approvals.yml`.
2. Create Neon roles `portfolio_api` and `portfolio_publisher`, apply `db/migrations/001_release_evidence.sql`, and set a Neon branch aside for migration validation.
3. Run `uv sync`, `uv run python scripts/run_evaluation.py`, and `uv run python scripts/build_release.py --revision <immutable-git-sha>` locally.
4. Set `NEON_PUBLISHER_DATABASE_URL` only in the publisher shell, then run `uv run python scripts/publish_release.py`.
5. Connect the private GitHub repository to Cloudflare Pages with root directory `web`, build command `pnpm build`, output directory `dist`, and secrets `NEON_API_DATABASE_URL` and `ALLOWED_ORIGIN`.
6. Protect `main`; require Python, web, and migration checks before the Cloudflare production deployment. Cloudflare preview deployments are used for pull requests.

## Rollback and teardown

Cloudflare deployment rollback changes only static application code; it never changes release history. To change displayed evidence, publish a new validated release and advance `current_release`. To tear down, remove Cloudflare secrets, delete the Pages project, revoke Neon roles/credentials, and retain the local source and provenance records.

## Cost guardrails

Use Cloudflare Free and Neon Free only. Do not attach a payment method, custom domain, paid Worker plan, storage bucket, scheduled job, or always-on database setting without a new recorded approval. The public Function is cacheable for one hour and has no write route.
