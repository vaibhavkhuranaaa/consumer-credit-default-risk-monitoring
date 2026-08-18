# 0015 Release and portfolio publication

## Decision

License the project code and documentation under MIT, publish the verified source as `v1.0.0`, align the canonical Cloudflare deployment to that source, and apply the governed project package to the public portfolio.

## Why

MIT makes code reuse terms explicit while leaving the UCI dataset under its separate CC BY 4.0 license. A formal release gives reviewers a stable public version. Source-aligned deployment and portfolio publication preserve the existing evidence boundary across GitHub, the live workstation, and the case study.

## Alternatives rejected

- Leaving the code unlicensed was rejected because public visibility alone does not grant reuse rights.
- Applying CC BY 4.0 to the code was rejected because that is the dataset license, not the selected software license.
- Publishing a release before green CI and live-source verification was rejected because the tag must identify the verified source.
- Rebuilding the portfolio narrative by hand was rejected because the governed package already carries the approved scope, evidence, architecture, and limitations.

## Not done

No model, metric, threshold, dataset field, privacy rule, database record, provider tier, visibility setting, or product claim changed. No protected demographic field is published.

## Changed

The repository now states separate software and dataset licenses. The verified source is released as `v1.0.0`, the canonical deployment identifies that source, and the portfolio consumes the reviewed project package.
