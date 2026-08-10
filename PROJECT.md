# Consumer Credit Default Risk & Portfolio Monitoring

## Portfolio contract

- **Category / industry:** data science analytics / Consumer Credit Risk
- **Industry question:** Does a non-demographic research model provide stable, calibrated evidence beyond simple baselines, and what historical workload/capture trade-off does a bounded simulated review queue show?
- **Owner-facing user and decision:** A credit-risk analyst evaluates model readiness, compares review-capacity scenarios, and inspects why an academic record falls inside or outside a simulated research review set. No automated approval, denial, pricing, adverse-action, or lending decision is made.
- **Data classification:** UCI Default of Credit Card Clients, CC BY 4.0, downloaded after recorded approval. The public analyst artifact may serve licensed non-demographic source fields, derived measures, and retrospective research scores. Demographic fields remain local and are used only in the documented aggregate fairness audit.
- **Demo status:** A 30,000-row, non-demographic read-only analyst product is deployed at `https://consumer-credit-risk-workbench.pages.dev`. It presents an academic benchmark and accepts no viewer writes or lending actions.
- **First-demo workflow:** Build a checksum-traceable 30,000-row research artifact, search and filter non-demographic source fields, inspect derived evidence, and review aggregate evaluation and fairness evidence separately.
- **Public URL target:** `/projects/consumer-credit-default-risk-monitoring`
- **Hosted demo:** `https://consumer-credit-risk-workbench.pages.dev`
- **GitHub repository:** Private repository approved for source control and quality checks: `vaibhavkhuranaaa/consumer-credit-default-risk-monitoring`.

## Success criteria

1. A reviewer can reproduce data validation, governed analyst-artifact generation, leakage controls, and baseline/challenger evaluation from documented local commands.
2. Evaluation reports AUROC, PR-AUC, Brier score, calibration diagnostics, threshold metrics, uncertainty, stability, simple baselines, approved non-demographic robustness checks, and documented aggregate fairness diagnostics without representing the data as BNPL.
3. The product records data provenance, evaluation freshness, feature policy, model limitations, no-decision boundary, and every public claim in evidence records.
4. Record-level analysis may state that a row is inside or outside a selected retrospective score-ranked review set. It must not translate that placement into an approval, denial, price, adverse-action reason, or lending recommendation.

## Delivery constraints

- This is an academic consumer-credit default benchmark, not Capital One, BNPL, or production lending data.
- Do not use protected/demographic fields for training, targeting, recommendations, or individual public display. They are local-only inputs to the documented aggregate fairness audit.
- Do not change public visibility, add paid services, or alter deployment/data boundaries until the corresponding `.project/approvals.yml` entry is explicitly approved.
- All evaluation splits must prevent target leakage and distinguish retrospective prediction from operational lending decisions.
