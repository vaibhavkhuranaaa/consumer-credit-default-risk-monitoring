from pathlib import Path

import pandas as pd
import pytest
from sklearn.linear_model import LogisticRegression

import credit_risk.pipeline as pipeline_module

from credit_risk.pipeline import (
    EXPECTED_COLUMNS,
    PROTECTED_COLUMNS,
    TARGET,
    capacity_table,
    deterministic_order,
    feature_columns,
    load_and_validate,
    repayment_delay_rule,
    repeated_development_evaluation,
    split_frame,
    split_identity,
)
from credit_risk.release_contract import build_release, validate_release
from scripts.build_public_dataset import enrich, public_evaluation, public_frame
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
    assert split_identity(first)["holdout"] == split_identity(second)["holdout"]
    assert split_identity(first)["holdout"]["frozen"] is True


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
        "version": 4,
        "source": {
            "rows": 1,
            "columns": ["ID", "LIMIT_BAL"],
            "selected_model": "model",
            "evaluation_sha256": evaluation_hash,
            "evaluation_schema_version": 2,
            "evaluation_generated_at_utc": "2026-08-10T00:00:00+00:00",
            "evaluated_revision": "a1b2c3d4",
            "protected_attribute_boundary": "local fairness audit only",
        },
        "records": [{"ID": 1, "LIMIT_BAL": 50_000, "research_score": 0.2, "research_score_rank": 1}],
        "evidence": evaluation,
    }
    validate_artifact(artifact, evaluation_bytes)
    artifact["records"][0]["AGE"] = 30
    with pytest.raises(ValueError, match="forbidden public field"):
        validate_artifact(artifact, evaluation_bytes)


def test_rank_and_capacity_evidence_are_deterministic_and_interval_complete() -> None:
    frame = public_frame(_valid_source_frame().head(3)).copy()
    frame["ID"] = [9, 2, 5]
    enriched = enrich(frame, __import__("numpy").array([.4, .4, .8]))
    assert enriched.sort_values("research_score_rank")["ID"].tolist() == [5, 2, 9]
    assert deterministic_order(__import__("numpy").array([.4, .4, .8]), __import__("numpy").array([9, 2, 5])).tolist() == [2, 1, 0]
    rows = capacity_table(
        pd.Series(([0, 1] * 50)),
        __import__("numpy").linspace(0, 1, 100),
        pd.Series(range(100)),
        iterations=30,
    )
    assert [row["capacity"] for row in rows] == [.05, .10, .20, .35, .50]
    assert all(row["confidence_intervals_95"]["precision"] for row in rows)


def test_repayment_rule_is_target_free_and_public_evidence_keeps_fairness_local() -> None:
    frame = pd.DataFrame({
        "PAY_0": [0, 2, 0, 1], "PAY_2": [0, 0, 3, 0], "PAY_3": [0] * 4,
        "PAY_4": [0] * 4, "PAY_5": [0] * 4, "PAY_6": [0] * 4,
    })
    assert repayment_delay_rule(frame).tolist() == [.10, .70, .45, .25]
    evaluation = {"models": {"model": {"aggregate_fairness_diagnostics": {"SEX": []}, "metrics": {}}}}
    assert "aggregate_fairness_diagnostics" not in public_evaluation(evaluation)["models"]["model"]
    assert "aggregate_fairness_diagnostics" in evaluation["models"]["model"]


def test_repeated_development_folds_and_paired_deltas_are_deterministic(monkeypatch: pytest.MonkeyPatch) -> None:
    numpy = __import__("numpy")
    rng = numpy.random.default_rng(7)
    columns = [column for column in EXPECTED_COLUMNS if column not in {"ID", *PROTECTED_COLUMNS, TARGET}]
    frame = pd.DataFrame(rng.normal(size=(180, len(columns))), columns=columns)
    frame["ID"] = range(1, 181)
    frame[TARGET] = ([0, 1, 0] * 60)
    for column in ("PAY_0", "PAY_2", "PAY_3", "PAY_4", "PAY_5", "PAY_6"):
        frame[column] = rng.integers(-2, 4, len(frame))
    factory = lambda: LogisticRegression(max_iter=500, random_state=1)
    monkeypatch.setattr(pipeline_module, "model_factories", lambda: {
        "logistic_baseline": factory,
        "calibrated_hist_gradient_boosting": factory,
        "calibrated_extra_trees": factory,
    })
    first = repeated_development_evaluation(frame, columns, "calibrated_hist_gradient_boosting")
    second = repeated_development_evaluation(frame, columns, "calibrated_hist_gradient_boosting")
    assert first == second
    assert first["split_count"] == 6
    assert first["identical_folds_across_models"] is True
    logistic = next(row for row in first["paired_comparisons"] if row["reference"] == "logistic_baseline")
    assert logistic["overall_status"] == "tie"
    assert logistic["metrics"]["pr_auc"]["confidence_interval_95"] == [0.0, 0.0]
    assert {row["feature_group"] for row in first["feature_group_ablations"]} == set(pipeline_module.FEATURE_GROUPS)
    assert all(row["overall_status"] == row["metrics"]["pr_auc"]["status"] for row in first["feature_group_ablations"])


def _release() -> dict:
    model = {
        "metrics": {"auroc": 0.7, "pr_auc": 0.4, "brier": 0.2, "ece_10_bin": 0.02},
        "confidence_intervals_95": {"auroc": [0.6, 0.8], "pr_auc": [0.3, 0.5], "brier": [0.1, 0.3]},
        "threshold_tradeoffs": [
            {"capacity": capacity, "review_rate": capacity, "queue_size": int(100 * capacity), "precision": 0.3, "recall": capacity, "captured_defaults": int(30 * capacity), "non_default_reviews": int(70 * capacity), "lift_vs_random": 1.0, "incremental_yield": None if index == 0 else 0.3, "confidence_intervals_95": {"precision": [0.2, 0.4]}}
            for index, capacity in enumerate((.05, .10, .20, .35, .50))
        ],
        "lift_by_decile": [{"decile": 1, "n": 100, "default_rate": 0.4, "lift": 2.0}],
        "calibration_curve": [{"bin": "0.1-0.2", "n": 100, "mean_score": 0.15, "observed_rate": 0.16, "sparse": False, "warning": None}],
        "calibration_diagnostics": {"slope": 1.0, "intercept": 0.0},
    }
    models = {name: model for name in ("prevalence_random_baseline", "repayment_delay_rule", "logistic_baseline", "calibrated_extra_trees")}
    models["calibrated_hist_gradient_boosting"] = {**model, "aggregate_fairness_diagnostics": {"SEX": []}}
    evaluation = {
        "schema_version": 2,
        "generated_at_utc": "2026-08-10T00:00:00+00:00",
        "scope": "Local-only retrospective academic benchmark; not a lending decision system",
        "readiness": {"verdict": "research only"},
        "lineage": {"evaluated_revision": "a1b2c3d4", "command": "test", "source_sha256": "b" * 64},
        "split": {"method": "fixed stratified 60/20/20", "random_state": 1, "limitation": "Not out-of-time."},
        "feature_policy": {"included_count": 19, "excluded": ["ID", "SEX", "EDUCATION", "MARRIAGE", "AGE", TARGET]},
        "selection": {"selected_model": "calibrated_hist_gradient_boosting", "gate": "test", "eligible_models": ["calibrated_hist_gradient_boosting"], "status": "promoted", "locked_before_holdout_audit": True},
        "baselines": {},
        "development_evaluation": {"identical_folds_across_models": True},
        "models": models,
    }
    manifest = {"datasets": [{"id": "uci-default-credit-card-clients", "license": "CC BY 4.0", "archive_sha256": "a" * 64, "extracted_file_sha256": "b" * 64, "validation": {"rows": 30000, "columns": 25, "missing_cells": 0, "duplicate_ids": 0}}]}
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
