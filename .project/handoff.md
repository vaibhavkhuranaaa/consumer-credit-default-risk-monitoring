# Handoff

## Current release

M9 is complete. The verified public product is https://consumer-credit-risk-workbench.pages.dev, backed by read-only Neon release evidence and a 30,000-row non-demographic analyst artifact.

Application revision `142462ab74d0a2e3eb7cce131830b9eff71b1a86` is deployed as Cloudflare Pages deployment `7b840f48-b262-40aa-8298-86deb84e6de3`. It serves immutable aggregate release `753cba75-e986-4128-a353-6ed2d7c411d9` from evaluated revision `7f602e4977b824d9bc3ecb61a65a08e88adf5b67`.

## Verification evidence

The clean local release gate and GitHub Actions quality run `31356386184` passed for the application revision. The live verifier then passed database health, current-release availability, security and cache headers, exact aggregate lineage, the 30,000-row artifact contract, and exclusion of sex, education, marriage, and age.

`docs/RELEASE-LOG.md` records the credential-free artifact hashes, deployment ID, URL, verification timestamp, and rollback status. The preceding replacement-project deployment failed health verification and is not a rollback candidate.

## Next action

Complete only M10: package the verified portfolio case study, update evidence-backed claims to the new URL, and retain the academic benchmark and no-automated-decision boundary. Do not merge the draft PR, change repository visibility, add billing, or exercise rollback/teardown without separate approval.

Graph freshness remains pending. No transmission occurred because explicit permission to send repository source and governance content to the configured Gemini-backed Graphify semantic service has not been granted.

## Safety boundary

The raw workbook and demographic fields remain local and ignored by Git. Cloudflare stores only the read-only `portfolio_api` connection credential and allowed origin as encrypted secrets. No publisher credential, raw data, protected attributes, model binary, or lending action is exposed.
