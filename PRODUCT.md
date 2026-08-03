# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hiring managers and credit-risk analysts reviewing an academic benchmark. Their job is to understand aggregate retrospective risk evidence without making a lending decision.

## Product Purpose

Provide a reproducible, governed view of benchmark model quality, review-capacity trade-offs, and aggregate fairness diagnostics.

## Positioning

The product makes its non-decision boundary and evaluation limitations first-class evidence, rather than presenting a credit score or lending recommendation.

## Operating Context

The evaluation and release publisher run locally. A public, read-only Cloudflare Pages dashboard displays only the approved aggregate evidence fetched through a Pages Function.

## Capabilities and Constraints

The dashboard shows no individual accounts, IDs, demographic values, approvals, denials, pricing, or lending recommendations. Sex and age appear only as aggregate diagnostic group labels. The source has a single target horizon, so evaluation is retrospective and not out-of-time.

## Evidence on Hand

UCI CC BY 4.0 source provenance is recorded in `.project/data-manifest.yml`; local evaluation results are generated at `artifacts/evaluation.json`.

## Product Principles

- Governed evidence before prediction.
- Aggregate review, never automated consumer-credit decisions.
- Reproducibility and limitations are visible in the workflow.
- Accessible operational clarity over visual flourish.

## Accessibility & Inclusion

Keyboard-accessible controls, visible focus states, semantic headings, readable contrast, and no meaning conveyed only by color.
