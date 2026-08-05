# Consumer Credit Default Risk & Portfolio Monitoring

## Portfolio contract

- **Category / industry:** data science analytics / Consumer Credit Risk
- **Industry question:** Which approved consumer-credit accounts show elevated next-period repayment-default risk, and what evidence supports a governed portfolio review?
- **Owner-facing user and decision:** Credit-risk analyst prioritizes a bounded review queue; no automated approval, denial, pricing, or lending decision is made.
- **Data classification:** UCI Default of Credit Card Clients, CC BY 4.0, downloaded after recorded approval. Under `public_individual_record_scope`, the full licensed source rows, including source IDs and demographic fields, may be served in the analyst product. The source contains no direct identity data.
- **Demo status:** A full-record, read-only analyst product is authorized. It presents an academic benchmark and accepts no viewer writes or lending actions.
- **First-demo workflow:** Build a checksum-traceable full-record artifact, search and filter all 30,000 source rows, inspect each field, and review evaluation evidence separately.
- **Public URL target:** `/projects/consumer-credit-default-risk-monitoring`
- **GitHub repository:** Private repository approved for source control and quality checks: `vaibhavkhuranaaa/consumer-credit-default-risk-monitoring`.

## Success criteria

1. A reviewer can reproduce data validation, full-record artifact generation, leakage controls, and baseline/challenger evaluation from documented local commands.
2. Evaluation reports AUROC, PR-AUC, Brier score, calibration error, threshold metrics, confidence intervals, and documented fairness diagnostics without representing the data as BNPL.
3. The product records data provenance, feature policy, model limitations, no-decision boundary, and every public claim in evidence records.

## Delivery constraints

- This is an academic consumer-credit default benchmark, not Capital One, BNPL, or production lending data.
- Do not use protected/demographic fields for training, targeting, or recommendations. Their public display is limited to the approved academic source-record workspace.
- Do not change public visibility, add paid services, or alter deployment/data boundaries until the corresponding `.project/approvals.yml` entry is explicitly approved.
- All evaluation splits must prevent target leakage and distinguish retrospective prediction from operational lending decisions.
