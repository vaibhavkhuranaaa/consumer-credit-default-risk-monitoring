"""Publish a validated aggregate release to Neon Postgres using a publisher-only credential."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import psycopg

from credit_risk.release_contract import validate_release


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", type=Path, default=Path("artifacts/release.json"))
    args = parser.parse_args()
    database_url = os.environ.get("NEON_PUBLISHER_DATABASE_URL")
    if not database_url:
        raise SystemExit("NEON_PUBLISHER_DATABASE_URL is required; no network action was taken.")
    release = json.loads(args.file.read_text())
    validate_release(release)
    with psycopg.connect(database_url) as connection, connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO model_releases (release_id, released_at, code_revision, scope, source, split, feature_policy, public_payload) VALUES (%(release_id)s, %(released_at)s, %(code_revision)s, %(scope)s, %(source)s, %(split)s, %(feature_policy)s, %(payload)s)",
            {**release, "source": json.dumps(release["source"]), "split": json.dumps(release["split"]), "feature_policy": json.dumps(release["feature_policy"]), "payload": json.dumps(release)},
        )
        for model_name, model in release["models"].items():
            for metric_name, value in model["metrics"].items():
                cursor.execute("INSERT INTO evaluation_metrics (release_id, model_name, metric_name, value, confidence_interval) VALUES (%s, %s, %s, %s, %s)", (release["release_id"], model_name, metric_name, value, json.dumps(model["confidence_intervals_95"].get(metric_name))))
            for row in model["threshold_tradeoffs"]:
                cursor.execute("INSERT INTO threshold_tradeoffs (release_id, model_name, threshold, review_rate, precision, recall) VALUES (%s, %s, %s, %s, %s, %s)", (release["release_id"], model_name, row["threshold"], row["review_rate"], row["precision"], row["recall"]))
            for audit_name, groups in model.get("aggregate_fairness_diagnostics", {}).items():
                for group in groups:
                    cursor.execute("INSERT INTO fairness_diagnostics (release_id, model_name, diagnostic_name, group_label, sample_size, default_rate, auroc, mean_score) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)", (release["release_id"], model_name, audit_name, group["group"], group["n"], group["default_rate"], group["auroc"], group["mean_score"]))
        for check_name, check_value in release["source"]["validation"].items():
            cursor.execute("INSERT INTO data_quality_checks (release_id, check_name, check_value) VALUES (%s, %s, %s)", (release["release_id"], check_name, json.dumps(check_value)))
        cursor.execute("INSERT INTO current_release (singleton, release_id) VALUES (true, %s) ON CONFLICT (singleton) DO UPDATE SET release_id = EXCLUDED.release_id, updated_at = now()", (release["release_id"],))
    print(f"Published aggregate release: {release['release_id']}")


if __name__ == "__main__":
    main()
