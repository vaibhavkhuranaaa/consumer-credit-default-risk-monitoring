# 0014 Publication readiness and accessibility closure

## Decision

Migrate private delivery state out of the public repository, keep the verified dashboard design, and make only measured accessibility, interaction, metadata, and publication-hygiene corrections.

## Why

The deployed product, model evidence, privacy boundary, and dashboard hierarchy were already strong. The audit found tracked delivery records, public integrity values, missing release documentation, undersized mobile controls, non-removable filter tokens, incomplete filter announcements, and ARIA structures that overstated chart and matrix semantics.

## Alternatives rejected

- A visual redesign was rejected because browser and stakeholder evidence supported the existing workstation hierarchy.
- New UI dependencies were rejected because native HTML, CSS, SVG, and existing React state covered every verified gap.
- Model, data, provider, or deployment changes were rejected because the audit found no evidence requiring them.
- Public integrity values were rejected because exact lineage belongs in the private ops record.

## Not done

No push, deployment, release, paid resource, visibility change, provider change, model reselection, artifact rewrite, rollback, teardown, or public metadata mutation was performed. A project code license remains a human legal choice.

## Changed

Delivery records moved to the private sibling. Reproducibility scripts now resolve the private data manifest through one shared path helper with an environment override. Public documentation carries the required architecture, evaluation, limits, scaling, visuals, and credential-free release evidence. Dashboard changes add valid chart semantics, keyboard-focusable scroll regions, 44px mobile targets, removable filter tokens, and live result-count announcements while preserving all research and privacy boundaries.
