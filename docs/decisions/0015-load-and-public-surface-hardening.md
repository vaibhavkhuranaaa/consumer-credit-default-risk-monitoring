# 0015 Load and public-surface hardening

## Decision

Make fresh-checkout development use the canonical governed artifact when no local artifact exists, bound the browser load, and require superseded public surfaces to be retired or redirected before publication.

## Why

The canonical dashboard is healthy, but an ignored governed artifact made a fresh development checkout fail closed with no usable dashboard. A separate superseded deployment also remained reachable outside the current publication boundary.

## Alternatives rejected

- Committing the governed dataset was rejected because datasets do not belong in the public repository.
- Falling back across deployments in production was rejected because it could silently mix application and evidence versions.
- Adding a proxy service was rejected because Vite can redirect one development request without another runtime or dependency.

## Not done

No public deployment, redirect, teardown, push, provider change, or visibility change was performed. Provider-side retirement still requires explicit approval and access to the owning Cloudflare account.

## Changed

Vite now prefers a generated local artifact and otherwise redirects only the development artifact request to the canonical deployment. Browser loading has a 20-second timeout with actionable failure copy. The live verifier now blocks publication while a superseded record surface remains reachable.
