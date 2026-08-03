# Handoff

## Current release

The public showcase is live at https://consumer-credit-default-risk-monitoring.pages.dev. Its approved release is aggregate-only and read-only. Verify a new release locally, publish it with the publisher-only Neon role, then deploy the static build through the approved release workflow.

## Next action

Start M7 from `docs/NEXT-MILESTONE-PLAN.md`. Do not begin M8 or later milestones until M7 acceptance is verified. GitHub-required branch protection cannot be enabled for this private repository on the current plan; retain privacy and use the documented compensating release gate unless a new approval changes that constraint.

## Safety boundary

Do not change repository visibility, add paid services, deploy unapproved changes, or make a credit decision claim. Keep raw data local, ignored by Git, and out of public artifacts.
