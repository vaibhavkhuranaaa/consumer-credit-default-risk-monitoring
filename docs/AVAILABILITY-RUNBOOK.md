# Availability and fail-closed runbook

## Service contract

The public product is a read-only academic benchmark. It must either serve one internally consistent, approved release or show the governed unavailable state. It never falls back to stale embedded records, exposes credentials, or accepts viewer writes.

Owner: Vaibhav Khurana. Manual check cadence: before and after every approved deployment, after any provider incident, and weekly while the project is used as an active portfolio demonstration. No scheduled job, third-party monitor, visitor analytics, or paid service is authorized.

## First diagnostic

Run the bounded, read-only health request:

```sh
curl -fsS -A 'consumer-credit-release-verifier/1.0' https://consumer-credit-risk-workbench.pages.dev/api/v1/health
```

A healthy response reports `status: ready`, database connectivity, current-release availability, and the release ID. `/source.json` reports deployment status and the exact sanitized application-source commit only. Neither endpoint contains credentials, visitor information, or historical revision identifiers. `configured` alone is not healthy.

## Failure guide

| Symptom | First check | Safe response |
| --- | --- | --- |
| Analyst artifact unavailable | Request `/data/analyst-workspace.json` and inspect status/cache headers | Keep the governed unavailable screen visible; verify the file exists in the intended Pages deployment |
| Health reports database unreachable | Inspect Neon project status and the `NEON_API_DATABASE_URL` Pages secret name | Allow the free Neon project to wake; do not enable paid always-on capacity |
| Current release missing | Query `public_release_snapshot` with the read-only role | Do not advance release state from the browser; use the approved local publisher only |
| API returns stale evidence | Compare health/API release ID and revision with `docs/RELEASE-LOG.md` | Purge no data; publish a new immutable release only through the release checklist |
| Static asset remains stale | Check `Cache-Control` and deployment revision | Verify the deployment, then use Cloudflare's normal revalidation; do not bypass the artifact hash gate |
| Security header missing | Run the live verifier below | Treat the deployment as failed and return to the last verified Pages deployment |
| Superseded public surface remains reachable | Run the live verifier and confirm the retired endpoint redirects to the canonical deployment or returns `404`/`410` | Stop publication and have the owning Cloudflare account retire or redirect the superseded project |

## Approved-deployment verification

After deployment, run:

```sh
uv run python scripts/verify_live_release.py \
  --base-url https://consumer-credit-risk-workbench.pages.dev \
  --expected-release-id <approved-release-id> \
  --expected-source-sha <approved-application-commit>
```

The verifier checks the site, health endpoint, aggregate release, analyst artifact, anonymous deployment-source marker, and retirement of the superseded public surface; required security/cache headers; exact model-release and application-source lineage; the 30,000-row artifact contract; and absence of demographic fields.

## M12 recovery rehearsal

Vaibhav Khurana completed the non-destructive rehearsal at `2026-08-10T17:19:41Z`.

- Wrangler `4.120.0` identified current production deployment `80490f04-ad1c-4207-87df-55cabd4dbf08` from source `historical-release`.
- The live verifier passed against the production alias for immutable release `f7c0c305-caf8-4003-9f1b-4aeacb37ec63`, evaluated revision `historical-release`, and source `historical-release`.
- The nearest prior successful production deployment at rehearsal time, `91d1f5fb-c0cd-42d8-a711-e27b48ff7626` from source `historical-release`, passed the same verifier through its immutable deployment URL. It was the rehearsal recovery target.
- Only the encrypted Cloudflare secret names `ALLOWED_ORIGIN` and `NEON_API_DATABASE_URL` were enumerated. Neon inventory confirmed Free project `muddy-paper-86533562` and primary branch `br-jolly-rice-aymfs80u` (`main`). No secret value was read.
- The production alias, Pages project, secrets, Neon roles, branch, database, and immutable release remained unchanged. Failed deployment `c02d27b2-613b-475f-88d0-d74f3cb2f62f` remains ineligible.

## Approved rollback procedure

An actual rollback requires a new explicit approval. Cloudflare Pages rollback is performed from the deployment history in the Cloudflare dashboard; the rehearsal stops before that control.

1. Record the deployment currently serving production, then enumerate the production deployment history. Select the nearest prior successful deployment whose source and immutable release appear in `docs/RELEASE-LOG.md`; never select a failed or preview deployment.
2. Run the live verifier against that deployment's immutable URL with its recorded release ID, evaluated revision, and application source. Stop if any lineage, artifact, privacy, header, cache, or health check fails.
3. After approval, use Cloudflare Dashboard → Workers & Pages → `consumer-credit-risk-workbench` → Deployments → the verified target → Rollback.
4. Re-run the verifier against the production alias with the target's recorded source. If it fails, restore the deployment recorded in step 1 from the same history and verify its recorded source.
5. Record the operator, UTC timestamp, selected deployment, verifier result, and incident reason. Do not publish or mutate the Neon release: this rollback changes application/static assets only.

## Approval-gated teardown procedure

Teardown owner: Vaibhav Khurana. These commands are documentation, not an authorization or execution record. Before starting, obtain explicit teardown approval, preserve the credential-free release/evaluation records in Git, and remove the project from the portfolio admission workflow so no public catalog points to a service being removed.

1. Confirm the exact Pages project, production deployment, Neon project, and branch IDs above. Confirm there is no custom domain, scheduled monitor, paid capacity, storage bucket, or visitor analytics to remove.
2. Remove the two Cloudflare encrypted secrets interactively; never put a credential value on the command line or in evidence:

   ```sh
   pnpm --dir web exec wrangler pages secret delete ALLOWED_ORIGIN --project-name consumer-credit-risk-workbench
   pnpm --dir web exec wrangler pages secret delete NEON_API_DATABASE_URL --project-name consumer-credit-risk-workbench
   ```

3. Revoke and drop the least-privilege `portfolio_api` and `portfolio_publisher` database roles from an owner session. Confirm no remaining grants or active sessions before continuing. Do not delete the local licensed source, provenance, evaluation, or release log.
4. Delete the Pages project with the interactive confirmation intact:

   ```sh
   pnpm --dir web exec wrangler pages project delete consumer-credit-risk-workbench
   ```

5. Delete Neon project `muddy-paper-86533562` from the Neon console. Neon project deletion removes its branches, endpoints, databases, and roles; record the provider confirmation and UTC time without credentials.
6. Verify that the production and immutable deployment URLs no longer serve the application, the Pages project is absent from `wrangler pages project list`, the Neon project is absent from `neonctl projects list`, and the portfolio/resume surfaces no longer link to the retired service.

The deletion sequence deliberately removes public entry points before the database project. Stop on any identity mismatch or unexpected dependent resource. Recovery or teardown must never silently change repository visibility, providers, billing, or the immutable research evidence.

Provider references: [Cloudflare Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/), [Wrangler Pages commands](https://developers.cloudflare.com/workers/wrangler/commands/pages/), [Cloudflare Pages project deletion API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/delete/), and [Neon project management](https://neon.com/docs/manage/projects).
