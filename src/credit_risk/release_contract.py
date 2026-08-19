"""Aggregate-only public release contract and validation."""

from __future__ import annotations

import copy
import json
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

RELEASE_VERSION = 2
REQUIRED_MODELS = {
    "prevalence_random_baseline",
    "repayment_delay_rule",
    "logistic_baseline",
    "calibrated_hist_gradient_boosting",
    "calibrated_extra_trees",
}
REQUIRED_METRICS = {"auroc", "pr_auc", "brier", "ece_10_bin"}
REQUIRED_TRADEOFF_FIELDS = {
    "capacity", "review_rate", "queue_size", "precision", "recall",
    "captured_defaults", "non_default_reviews", "lift_vs_random",
    "incremental_yield", "confidence_intervals_95",
}
FORBIDDEN_PUBLIC_KEYS = {
    "raw_rows", "raw_data", "accounts", "account_id", "customer_id",
    "customer_name", "email", "phone", "address", "ssn", "model_binary",
    "model_path", "credential", "password", "secret", "token",
    "aggregate_fairness_diagnostics",
}


def _public_models(evaluation: dict[str, Any]) -> dict[str, Any]:
    models = copy.deepcopy(evaluation["models"])
    for model in models.values():
        model.pop("aggregate_fairness_diagnostics", None)
    return models


def build_release(evaluation: dict[str, Any], manifest: dict[str, Any], code_revision: str) -> dict[str, Any]:
    """Create an immutable, aggregate-only release payload from verified local artifacts."""
    if not code_revision or code_revision == "uncommitted":
        raise ValueError("A declared immutable code revision is required for publication.")
    dataset = manifest["datasets"][0]
    payload = {
        "version": RELEASE_VERSION,
        "release_id": str(uuid.uuid4()),
        "released_at": datetime.now(UTC).isoformat(),
        "code_revision": code_revision,
        "scope": evaluation["scope"],
        "source": {
            "dataset_id": dataset["id"],
            "license": dataset["license"],
            "archive_sha256": dataset["archive_sha256"],
            "source_file_sha256": dataset["extracted_file_sha256"],
            "validation": dataset["validation"],
        },
        "evaluation": {
            "schema_version": evaluation["schema_version"],
            "generated_at_utc": evaluation["generated_at_utc"],
            "lineage": evaluation["lineage"],
            "readiness": evaluation["readiness"],
            "baselines": evaluation["baselines"],
            "development_evaluation": evaluation["development_evaluation"],
        },
        "split": evaluation["split"],
        "feature_policy": evaluation["feature_policy"],
        "selection": evaluation["selection"],
        "models": _public_models(evaluation),
    }
    validate_release(payload)
    return payload


def validate_release(payload: dict[str, Any]) -> None:
    """Fail closed unless a payload matches the narrow public aggregate contract."""
    expected = {
        "version", "release_id", "released_at", "code_revision", "scope", "source",
        "evaluation", "split", "feature_policy", "selection", "models",
    }
    if set(payload) != expected or payload["version"] != RELEASE_VERSION:
        raise ValueError("Invalid release envelope.")
    try:
        uuid.UUID(payload["release_id"])
        datetime.fromisoformat(payload["released_at"])
    except (ValueError, TypeError) as error:
        raise ValueError("Release identifiers are invalid.") from error
    if not isinstance(payload["code_revision"], str) or len(payload["code_revision"]) < 7:
        raise ValueError("An immutable code revision is required.")
    if "not a lending decision system" not in payload["scope"].lower():
        raise ValueError("Public scope must retain the no-decision boundary.")
    source = payload["source"]
    if set(source) != {"dataset_id", "license", "archive_sha256", "source_file_sha256", "validation"} or source["license"] != "CC BY 4.0":
        raise ValueError("Source provenance is incomplete.")
    evaluation = payload["evaluation"]
    if set(evaluation) != {"schema_version", "generated_at_utc", "lineage", "readiness", "baselines", "development_evaluation"}:
        raise ValueError("Evaluation freshness evidence is malformed.")
    if evaluation["schema_version"] != 2 or not evaluation["generated_at_utc"]:
        raise ValueError("Evaluation schema version or generation time is invalid.")
    if not evaluation["lineage"].get("evaluated_revision") or not evaluation["lineage"].get("command"):
        raise ValueError("Evaluation command and revision lineage are required.")
    if set(payload["feature_policy"]) != {"included_count", "excluded"}:
        raise ValueError("Feature policy is malformed.")
    if set(payload["selection"]) != {"selected_model", "gate", "eligible_models", "status", "locked_before_holdout_audit"}:
        raise ValueError("Model-selection evidence is malformed.")
    if payload["selection"]["locked_before_holdout_audit"] is not True:
        raise ValueError("The frozen holdout selection boundary is missing.")
    excluded = {str(value).lower() for value in payload["feature_policy"]["excluded"]}
    if not {"id", "sex", "education", "marriage", "age"}.issubset(excluded):
        raise ValueError("Protected attributes and identifiers must be excluded.")
    if set(payload["models"]) != REQUIRED_MODELS:
        raise ValueError("Unexpected public model set.")
    allowed_model_fields = {
        "metrics", "confidence_intervals_95", "threshold_tradeoffs", "lift_by_decile",
        "calibration_curve", "calibration_diagnostics", "non_demographic_cohort_robustness",
    }
    for model in payload["models"].values():
        if set(model).difference(allowed_model_fields):
            raise ValueError("Unexpected model content.")
        if set(model["metrics"]) != REQUIRED_METRICS:
            raise ValueError("Required metrics are missing.")
        tradeoffs = model.get("threshold_tradeoffs")
        if not isinstance(tradeoffs, list) or len(tradeoffs) != 5:
            raise ValueError("Review-capacity evidence is missing.")
        for row in tradeoffs:
            if not isinstance(row, dict) or not REQUIRED_TRADEOFF_FIELDS.issubset(row):
                raise ValueError("Review-capacity evidence is malformed.")
            if any(not isinstance(row[key], (int, float)) for key in ("capacity", "review_rate", "queue_size", "precision", "recall", "captured_defaults", "non_default_reviews", "lift_vs_random")):
                raise ValueError("Review-capacity evidence must be numeric.")
            if any(not 0 <= float(row[key]) <= 1 for key in ("capacity", "review_rate", "precision", "recall")):
                raise ValueError("Review-capacity evidence is outside its valid range.")
    if FORBIDDEN_PUBLIC_KEYS.intersection(_all_keys(payload)):
        raise ValueError("Public release contains forbidden individual or protected-attribute content.")


def _all_keys(value: Any) -> set[str]:
    if isinstance(value, dict):
        return set(value).union(*(_all_keys(item) for item in value.values()))
    if isinstance(value, list):
        return set().union(*(_all_keys(item) for item in value)) if value else set()
    return set()


def read_json(path: Path) -> dict[str, Any]:
    with path.open() as handle:
        return json.load(handle)
