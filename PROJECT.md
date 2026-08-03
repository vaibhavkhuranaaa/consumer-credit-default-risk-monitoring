# Consumer Credit Default Risk & Portfolio Monitoring

## Portfolio contract

- **Category / industry:** data science analytics / Consumer Credit Risk
- **Industry question:** Which approved consumer-credit accounts show elevated next-period repayment-default risk, and what evidence supports a governed portfolio review?
- **Owner-facing user and decision:** Credit-risk analyst prioritizes a bounded review queue; no automated approval, denial, pricing, or lending decision is made.
- **Data classification:** UCI Default of Credit Card Clients, CC BY 4.0, downloaded only after recorded approval. No direct identifiers. Demographic fields are excluded from model inputs and may be used only in a documented fairness audit.
- **Demo status:** Public, read-only aggregate-evidence showcase deployed after recorded approval. It makes no lending claim and accepts no viewer writes.
- **First-demo workflow:** Load a checksum-pinned dataset release, run time-safe baseline and challenger models, review calibration, threshold trade-offs, fairness diagnostics, data-quality controls, and an aggregate portfolio-risk queue.
- **Public URL target:** `/projects/consumer-credit-default-risk-monitoring`
- **GitHub repository:** Private repository approved for source control and quality checks: `vaibhavkhuranaaa/consumer-credit-default-risk-monitoring`.

## Success criteria

1. A reviewer can reproduce data validation, leakage controls, baseline/challenger evaluation, calibration, and aggregate queue generation from documented local commands.
2. Evaluation reports AUROC, PR-AUC, Brier score, calibration error, threshold metrics, confidence intervals, and documented fairness diagnostics without representing the data as BNPL.
3. The product records data provenance, feature policy, model limitations, no-decision boundary, and every public claim in evidence records.

## Delivery constraints

- This is an academic consumer-credit default benchmark, not Capital One, BNPL, or production lending data.
- Do not use protected/demographic fields for training, targeting, or recommendations.
- Do not change public visibility, add paid services, or alter deployment/data boundaries until the corresponding `.project/approvals.yml` entry is explicitly approved.
- All evaluation splits must prevent target leakage and distinguish retrospective prediction from operational lending decisions.
