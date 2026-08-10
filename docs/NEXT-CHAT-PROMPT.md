# New-chat prompt: review the M10 approval candidate

Continue the consumer-credit-default-risk-monitoring project. Read `AGENTS.md`, `PROJECT.md`, `PRODUCT.md`, `DESIGN.md`, all `.project/` records, `docs/NEXT-MILESTONE-PLAN.md`, `docs/metric-glossary.md`, and the final M10 evidence before acting. Use the project-delivery skill.

Complete only M10. The strengthened Credit Risk Model Validation & Review-Capacity Lab is implemented locally on `feature/m10-bi-dashboard`. Evaluated candidate `543dc446c48b2cc2208f2e6362863563a0f7514d` passed the full local gate. Review these exact-lineage screenshots:

- `docs/screenshots/m10/desktop-assurance.jpg`
- `docs/screenshots/m10/desktop-records.jpg`
- `docs/screenshots/m10/tablet-assurance.jpg`
- `docs/screenshots/m10/mobile-records.jpg`

Confirm whether the visual result is approved or changes are requested. Do not deploy, merge, publish, change visibility, add paid resources, change providers, exercise rollback, or transmit secrets. Visual approval alone does not authorize deployment; deployment requires a separate explicit approval and a matching green GitHub Actions quality run for the candidate revision.

Preserve the frozen 6,000-row holdout, evaluation schema v2, analyst artifact v4, aggregate release v2, demographic exclusions, local aggregate fairness only, narrow record-simulation fields, exact retrospective disclaimer, read-only availability states, and all documented limitations.
