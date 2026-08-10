# Real-data contract

## Approved dataset

- Dataset: UCI Default of Credit Card Clients.
- Citation: Yeh, I. (2009), DOI `10.24432/C55S3H`.
- License: CC BY 4.0; attribution required.
- Acquisition: approved and completed locally on 2026-08-01.
- Provenance: download URL, archive/extracted checksums, row count, schema, ranges, and acquisition date are pinned in `.project/data-manifest.yml`.

## Verified quality

The acquired workbook contains 30,000 rows and 25 source columns. Validation records zero missing cells, zero duplicate source IDs, a binary target, and expected observed field ranges. Schema, row-count, target, duplicate-ID, and range drift fail closed.

## Privacy and feature policy

Raw data remains local and ignored by Git. Sex, education, marriage, and age are excluded from model inputs, thresholds, public records, and individual analysis. They may be used only in the documented local aggregate fairness audit. The public version-4 analyst artifact contains licensed non-demographic fields, deterministic derived measures, out-of-fold retrospective research scores, deterministic ranks, and strengthened evaluation evidence. It contains no credentials, direct identifiers, or model binary.

## Demo rights and limitations

The licensed records may support a public, read-only academic research workbench with attribution. They must not be described as production, Capital One, BNPL, live customer, or lending-decision data. Source `ID` is an academic row identifier, not a consumer identity. Reported `LIMIT_BAL` is a credit-limit field, not current exposure, loss, or balance.

## Reproduction

`uv run python scripts/build_public_dataset.py` rebuilds the narrowed artifact from the checksum-pinned local source and current evaluation evidence. `uv run python scripts/validate_public_artifact.py` verifies lineage and forbidden-field exclusions.
