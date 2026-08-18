#!/usr/bin/env python3
"""Validate the generated analyst artifact before any release is considered."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

PROTECTED_FIELDS = {"SEX", "EDUCATION", "MARRIAGE", "AGE"}
FORBIDDEN_KEYS = {
    "accepted",
    "adverse_action_reason",
    "approval",
    "approved",
    "address",
    "credential",
    "customer_name",
    "denial",
    "denied",
    "email",
    "eligibility",
    "eligible",
    "ineligible",
    "lending_decision",
    "model_binary",
    "password",
    "phone",
    "price",
    "pricing",
    "recommendation",
    "rejected",
    "secret",
    "ssn",
    "token",
}


def validate_artifact(artifact: dict[str, Any], evaluation_bytes: bytes) -> None:
    if artifact.get("version") != 4:
        raise ValueError("Analyst artifact version must be 4.")
    source = artifact.get("source")
    records = artifact.get("records")
    evidence = artifact.get("evidence")
    if not isinstance(source, dict) or not isinstance(records, list) or not isinstance(evidence, dict):
        raise ValueError("Analyst artifact envelope is malformed.")
    expected_rows = source.get("rows")
    if not isinstance(expected_rows, int) or expected_rows <= 0 or len(records) != expected_rows:
        raise ValueError("Analyst artifact row count is invalid.")
    source_columns = set(source.get("columns", []))
    if PROTECTED_FIELDS.intersection(source_columns):
        raise ValueError("Protected attributes are forbidden from the public analyst artifact.")
    if source.get("protected_attribute_boundary") != "local fairness audit only":
        raise ValueError("Protected-attribute boundary is missing.")
    if source.get("evaluation_schema_version") != 2:
        raise ValueError("Evaluation schema version is missing or stale.")
    if not source.get("evaluation_generated_at_utc") or not source.get("evaluated_revision"):
        raise ValueError("Evaluation freshness lineage is incomplete.")
    expected_evaluation_hash = hashlib.sha256(evaluation_bytes).hexdigest()
    if source.get("evaluation_sha256") != expected_evaluation_hash:
        raise ValueError("Evaluation lineage hash does not match.")
    selection = evidence.get("selection", {})
    if source.get("selected_model") != selection.get("selected_model"):
        raise ValueError("Selected model does not match embedded evidence.")
    ids: set[int] = set()
    ranks: set[int] = set()
    for record in records:
        if not isinstance(record, dict):
            raise ValueError("Analyst artifact records must be objects.")
        keys = set(record)
        if PROTECTED_FIELDS.intersection(keys) or FORBIDDEN_KEYS.intersection(key.lower() for key in keys):
            raise ValueError("Analyst artifact contains a forbidden public field.")
        record_id = record.get("ID")
        score = record.get("research_score")
        rank = record.get("research_score_rank")
        if not isinstance(record_id, int) or record_id in ids:
            raise ValueError("Source row IDs must be unique integers.")
        if not isinstance(score, (int, float)) or not 0 <= score <= 1:
            raise ValueError("Research scores must be bounded probabilities.")
        if not isinstance(rank, int) or not 1 <= rank <= expected_rows or rank in ranks:
            raise ValueError("Research-score ranks must be a complete deterministic ordering.")
        ids.add(record_id)
        ranks.add(rank)
    if ranks != set(range(1, expected_rows + 1)):
        raise ValueError("Research-score rank denominator is incomplete.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--artifact", type=Path, default=Path("web/public/data/analyst-workspace.json"))
    parser.add_argument("--evaluation", type=Path, default=Path("artifacts/evaluation.json"))
    args = parser.parse_args()
    artifact_bytes = args.artifact.read_bytes()
    validate_artifact(json.loads(artifact_bytes), args.evaluation.read_bytes())
    print(f"Public analyst artifact: pass (sha256={hashlib.sha256(artifact_bytes).hexdigest()})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
