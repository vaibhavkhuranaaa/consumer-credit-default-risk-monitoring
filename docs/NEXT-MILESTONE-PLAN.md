# Next milestone plan

## Starting point

M0–M11 are complete. The M10 research lab remains live and verified at `https://consumer-credit-risk-workbench.pages.dev`. M11 packages its evidence into the repository README, final case study, portfolio manifest, and resume candidates without changing or publishing the application.

## M12 — Exercise rollback and teardown ownership

M12 is the next unblocked milestone and is separately approval-gated.

### Objective

Prove that the named owner can identify a safe rollback target and execute a precise teardown plan without making an uncontrolled production change.

### Proposed scope

1. Reconfirm the current Cloudflare deployment, Neon release, repository state, and zero-dollar boundary.
2. Verify that M9 deployment `7b840f48-b262-40aa-8298-86deb84e6de3` remains the only eligible diagnostic rollback target; never select failed deployment `c02d27b2-613b-475f-88d0-d74f3cb2f62f`.
3. Document a non-destructive rollback rehearsal that stops before changing production traffic.
4. Document teardown order, data-retention decisions, credential revocation, DNS/custom-domain non-applicability, verification, and ownership.
5. Run repository checks and update approvals, evidence, state, handoff, release checklist, and runbook together.

### Acceptance

- The rollback target is exact, eligible, and independently verifiable.
- The rehearsal changes no public traffic unless a separate explicit rollback approval is recorded.
- The teardown procedure is ordered, reversible where possible, and names the human owner for every resource.
- No secret appears in source or evidence.
- Project records and GitHub reflect the same final revision.

Do not begin M12, merge, change visibility, publish the case study, redeploy the product, roll back, tear down, add paid resources, change providers, or transmit secrets without the corresponding recorded approval.
