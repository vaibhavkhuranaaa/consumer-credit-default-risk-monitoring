# Availability and fail-closed runbook

## Service contract

The public product is a read-only academic benchmark. It must either serve one internally consistent, approved release or show the governed unavailable state. It never falls back to stale embedded records, exposes credentials, or accepts viewer writes.

Owner: Vaibhav Khurana. Manual check cadence: before and after every approved deployment, after any provider incident, and weekly while the project is used as an active portfolio demonstration. No scheduled job, third-party monitor, visitor analytics, or paid service is authorized.

## First diagnostic

Run the bounded, read-only health request:

```sh
curl -fsS -A 'consumer-credit-release-verifier/1.0' https://consumer-credit-risk-workbench.pages.dev/api/v1/health
```

A healthy response reports `status: ready`, database connectivity, current-release availability, release ID, and code revision. It reveals no credentials or visitor information. `configured` alone is not healthy.

## Failure guide

| Symptom | First check | Safe response |
| --- | --- | --- |
| Analyst artifact unavailable | Request `/data/analyst-workspace.json` and inspect status/cache headers | Keep the governed unavailable screen visible; verify the file exists in the intended Pages deployment |
| Health reports database unreachable | Inspect Neon project status and the `NEON_API_DATABASE_URL` Pages secret name | Allow the free Neon project to wake; do not enable paid always-on capacity |
| Current release missing | Query `public_release_snapshot` with the read-only role | Do not advance release state from the browser; use the approved local publisher only |
| API returns stale evidence | Compare health/API release ID and revision with `docs/RELEASE-LOG.md` | Purge no data; publish a new immutable release only through the release checklist |
| Static asset remains stale | Check `Cache-Control` and deployment revision | Verify the deployment, then use Cloudflare's normal revalidation; do not bypass the artifact hash gate |
| Security header missing | Run the live verifier below | Treat the deployment as failed and return to the last verified Pages deployment |

## Approved-deployment verification

After deployment, run:

```sh
uv run python scripts/verify_live_release.py \
  --base-url https://consumer-credit-risk-workbench.pages.dev \
  --expected-release-id <approved-release-id> \
  --expected-revision <full-git-sha>
```

The verifier checks the site, health endpoint, aggregate release, and analyst artifact; required security/cache headers; exact release lineage; 30,000-row artifact contract; and absence of demographic fields.

## Rollback diagnostic

The recovery target is the most recent prior Cloudflare Pages deployment whose application revision, aggregate release ID, and artifact hashes all appear in `docs/RELEASE-LOG.md`. Current verified deployment `bfd5f35a-86b2-40cb-b260-4f8967703236` may use verified M9 deployment `7b840f48-b262-40aa-8298-86deb84e6de3` as a diagnostic rollback target only after separate approval. Deployment `c02d27b2-613b-475f-88d0-d74f3cb2f62f` failed health verification and remains ineligible. A rollback changes application/static assets only; it must not mutate Neon release history.

## Teardown ownership

Teardown owner: Vaibhav Khurana. An actual teardown requires separate approval. The sequence is: export credential-free release evidence, remove Pages secrets, revoke the Neon roles, delete the Pages project, delete the Neon project, and retain the local licensed source and provenance records. Never delete local raw data as part of a cloud teardown.
