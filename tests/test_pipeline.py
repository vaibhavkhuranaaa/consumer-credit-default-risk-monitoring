from pathlib import Path

import pandas as pd
import pytest

from credit_risk.pipeline import EXPECTED_COLUMNS, PROTECTED_COLUMNS, TARGET, feature_columns, load_and_validate, split_frame
from credit_risk.release_contract import build_release, validate_release
from scripts.build_public_dataset import public_frame
from scripts.validate_public_artifact import validate_artifact


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


def _valid_source_frame() -> pd.DataFrame:
    values = {column: 0 for column in EXPECTED_COLUMNS}
    values.update({"LIMIT_BAL": 100_000, "SEX": 1, "EDUCATION": 2, "MARRIAGE": 1, "AGE": 35})
    frame = pd.DataFrame([values] * 30_000)
    frame["ID"] = range(1, 30_001)
    frame[TARGET] = [0, 1] * 15_000
    return frame


def test_source_validation_fails_closed_on_range_drift(monkeypatch: pytest.MonkeyPatch) -> None:
    frame = _valid_source_frame()
    frame.loc[0, "PAY_0"] = 9
    monkeypatch.setattr(pd, "read_excel", lambda *_args, **_kwargs: frame)
    with pytest.raises(ValueError, match="repayment-status range"):
        load_and_validate(Path("unused.xls"))


def test_public_frame_excludes_demographics() -> None:
    frame = _valid_source_frame().head(1)
    assert not set(PROTECTED_COLUMNS).intersection(public_frame(frame).columns)


def test_public_artifact_requires_lineage_and_rejects_demographics() -> None:
    evaluation = {"selection": {"selected_model": "model"}}
    evaluation_bytes = __import__("json").dumps(evaluation).encode()
    evaluation_hash = __import__("hashlib").sha256(evaluation_bytes).hexdigest()
    artifact = {
        "version": 3,
        "source": {
            "rows": 1,
            "columns": ["ID", "LIMIT_BAL"],
            "selected_model": "model",
            "evaluation_sha256": evaluation_hash,
            "protected_attribute_boundary": "local fairness audit only",
        },
        "records": [{"ID": 1, "LIMIT_BAL": 50_000, "research_score": 0.2}],
        "evidence": evaluation,
    }
    validate_artifact(artifact, evaluation_bytes)
    artifact["records"][0]["AGE"] = 30
    with pytest.raises(ValueError, match="forbidden public field"):
        validate_artifact(artifact, evaluation_bytes)


def _release() -> dict:
    model = {
        "metrics": {"auroc": 0.7, "pr_auc": 0.4, "brier": 0.2, "ece_10_bin": 0.02},
        "confidence_intervals_95": {"auroc": [0.6, 0.8], "pr_auc": [0.3, 0.5], "brier": [0.1, 0.3]},
        "threshold_tradeoffs": [{"capacity": 0.2, "review_rate": 0.4, "precision": 0.3, "recall": 0.7, "captured_defaults": 14}],
        "lift_by_decile": [{"decile": 1, "n": 100, "default_rate": 0.4, "lift": 2.0}],
        "calibration_curve": [{"bin": "0.1-0.2", "n": 100, "mean_score": 0.15, "observed_rate": 0.16}],
    }
    evaluation = {"scope": "Local-only retrospective academic benchmark; not a lending decision system", "split": {"method": "fixed stratified 60/20/20", "random_state": 1, "limitation": "Not out-of-time."}, "feature_policy": {"included_count": 19, "excluded": ["ID", "SEX", "EDUCATION", "MARRIAGE", "AGE", TARGET]}, "selection": {"selected_model": "calibrated_hist_gradient_boosting", "gate": "test", "eligible_models": ["calibrated_hist_gradient_boosting"], "status": "promoted"}, "models": {"logistic_baseline": model, "calibrated_extra_trees": model, "calibrated_hist_gradient_boosting": {**model, "aggregate_fairness_diagnostics": {"SEX": [{"group": "1", "n": 100, "default_rate": 0.2, "auroc": 0.7, "mean_score": 0.2}]}}}}
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
