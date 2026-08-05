from pathlib import Path

import pandas as pd
import pytest

from credit_risk.pipeline import PROTECTED_COLUMNS, TARGET, feature_columns, split_frame
from credit_risk.release_contract import build_release, validate_release


def test_feature_policy_excludes_demographics_and_target() -> None:
    candidate_features = [f"feature_{index}" for index in range(19)]
    columns = ["ID", *PROTECTED_COLUMNS, *candidate_features, TARGET]
    frame = pd.DataFrame([[1, 2, 1, 2, 30, *range(19), 0]], columns=columns)
    assert feature_columns(frame) == candidate_features


def test_split_is_deterministic_and_stratified() -> None:
    frame = pd.DataFrame({"ID": range(100), TARGET: [0] * 80 + [1] * 20})
    first = split_frame(frame)
    second = split_frame(frame)
    assert first.train["ID"].tolist() == second.train["ID"].tolist()
    assert (len(first.train), len(first.validation), len(first.test)) == (60, 20, 20)
    assert first.test[TARGET].mean() == 0.2


def _release() -> dict:
    model = {
        "metrics": {"auroc": 0.7, "pr_auc": 0.4, "brier": 0.2, "ece_10_bin": 0.02},
        "confidence_intervals_95": {"auroc": [0.6, 0.8], "pr_auc": [0.3, 0.5], "brier": [0.1, 0.3]},
        "threshold_tradeoffs": [{"threshold": 0.2, "review_rate": 0.4, "precision": 0.3, "recall": 0.7}],
    }
    evaluation = {"scope": "Local-only retrospective academic benchmark; not a lending decision system", "split": {"method": "fixed stratified 60/20/20", "random_state": 1, "limitation": "Not out-of-time."}, "feature_policy": {"included_count": 19, "excluded": ["ID", "SEX", "EDUCATION", "MARRIAGE", "AGE", TARGET]}, "models": {"logistic_baseline": model, "calibrated_hist_gradient_boosting": {**model, "aggregate_fairness_diagnostics": {"SEX": [{"group": "1", "n": 100, "default_rate": 0.2, "auroc": 0.7, "mean_score": 0.2}]}}}}
    manifest = {"datasets": [{"id": "uci-default-credit-card-clients", "license": "CC BY 4.0", "archive_sha256": "a" * 64, "validation": {"rows": 30000, "columns": 25, "missing_cells": 0, "duplicate_ids": 0}}]}
    return build_release(evaluation, manifest, "a1b2c3d4")


def test_public_release_allows_only_aggregate_evidence() -> None:
    release = _release()
    validate_release(release)
    release["models"]["logistic_baseline"]["raw_rows"] = [{"ID": 1}]
    with pytest.raises(ValueError):
        validate_release(release)


def test_public_release_rejects_credentials_and_identifiers() -> None:
    release = _release()
    release["models"]["logistic_baseline"]["token"] = "must-not-be-public"
    with pytest.raises(ValueError):
        validate_release(release)
