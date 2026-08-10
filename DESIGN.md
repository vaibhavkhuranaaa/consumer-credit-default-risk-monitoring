# User-facing design rules

> **Status: rejected and stale as of 2026-08-10.** The project owner rejected the live dashboard as generic, analytically shallow, and unsuitable for non-technical stakeholders. Do not treat the rules below or the current implementation as an approved target. M10 must replace this document with a stakeholder decision map, information architecture, KPI glossary, chart grammar, interaction contract, and owner-approved visual direction before public deployment. The current text is retained only to explain the design that produced the stale release.

## Visual system

- **Mode:** Operate. The public analyst workspace supports dense, evidence-led source-record review in a desk-lit session.
- **Color:** Restrained cool graphite and paper with a single cobalt action/state accent; warning and refusal use text plus icons, never color alone.
- **Type:** System sans stack, with a compact fixed type scale for metrics and dense evidence tables.
- **Composition:** A wide evidence canvas with a narrow governance rail. Use simple panels with either borders or soft elevation, never both.
- **Interaction:** Standard browser controls; clear loading, empty, error, and refusal states; all content is useful without animation.

## Product constraints

- The dashboard must lead with its retrospective academic-benchmark and no-decision boundary.
- Licensed non-demographic UCI source fields, derived measures, and retrospective research scores may be shown. Demographics remain local and aggregate-only in the fairness audit. Do not show credentials, direct identity data, model binaries, or an automated lending decision.
- Use three linked views: executive overview, portfolio workbench, and technical model lab. Charts must explain evaluation or review-capacity trade-offs, not decorate the page.
- Build responsive, keyboard-accessible interfaces; never hide essential meaning behind color alone.
