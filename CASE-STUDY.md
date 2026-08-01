# Case study draft — Consumer Credit Default Risk & Portfolio Monitoring

Status: local evaluation verified. No production readiness or lending claims are made.

The case study covers the decision boundary, source provenance, feature exclusions, leakage controls, calibration, fairness diagnostics, model limitations, and reproducibility evidence. The held-out calibrated challenger achieved AUROC 0.7915, PR-AUC 0.5737, Brier score 0.1315, and 10-bin calibration error 0.0120 on the UCI benchmark. Because the source has one target horizon, this is a fixed stratified retrospective split—not out-of-time or operational lending performance.
