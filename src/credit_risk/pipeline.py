"""Reproducible, local-only retrospective benchmark evaluation."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import pyarrow.parquet as pq
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, brier_score_loss, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

TARGET = "default payment next month"
ID_COLUMN = "ID"
PROTECTED_COLUMNS = ("SEX", "EDUCATION", "MARRIAGE", "AGE")
EXPECTED_COLUMNS = (
    "ID", "LIMIT_BAL", "SEX", "EDUCATION", "MARRIAGE", "AGE", "PAY_0", "PAY_2",
    "PAY_3", "PAY_4", "PAY_5", "PAY_6", "BILL_AMT1", "BILL_AMT2", "BILL_AMT3",
    "BILL_AMT4", "BILL_AMT5", "BILL_AMT6", "PAY_AMT1", "PAY_AMT2", "PAY_AMT3",
    "PAY_AMT4", "PAY_AMT5", "PAY_AMT6", "default payment next month",
)
RANDOM_STATE = 20260801


@dataclass(frozen=True)
class SplitData:
    train: pd.DataFrame
    validation: pd.DataFrame
    test: pd.DataFrame


def load_and_validate(source: Path) -> pd.DataFrame:
    """Load the official workbook and fail closed on schema/integrity drift."""
    frame = pd.read_excel(source, header=1)
    if tuple(frame.columns) != EXPECTED_COLUMNS:
        raise ValueError("Unexpected source schema; refusing to continue.")
    if len(frame) != 30_000 or frame[ID_COLUMN].duplicated().any():
        raise ValueError("Unexpected row count or duplicate IDs; refusing to continue.")
    if frame.isna().any().any() or set(frame[TARGET].unique()) != {0, 1}:
        raise ValueError("Missing values or invalid target values; refusing to continue.")
    if not frame["AGE"].between(21, 79).all() or not frame["LIMIT_BAL"].between(10_000, 1_000_000).all():
        raise ValueError("Observed source range changed; refusing to continue.")
    return frame


def split_frame(frame: pd.DataFrame) -> SplitData:
    """Create a fixed 60/20/20 stratified split. The source has no target-period variation."""
    train, temporary = train_test_split(
        frame, test_size=0.40, stratify=frame[TARGET], random_state=RANDOM_STATE
    )
    validation, test = train_test_split(
        temporary, test_size=0.50, stratify=temporary[TARGET], random_state=RANDOM_STATE
    )
    return SplitData(train=train.copy(), validation=validation.copy(), test=test.copy())


def feature_columns(frame: pd.DataFrame) -> list[str]:
    excluded = {ID_COLUMN, TARGET, *PROTECTED_COLUMNS}
    columns = [column for column in frame.columns if column not in excluded]
    if len(columns) != 19 or any(column in PROTECTED_COLUMNS for column in columns):
        raise ValueError("Feature policy violation.")
    return columns


def fit_models(splits: SplitData, columns: list[str]) -> dict[str, Any]:
    x_train, y_train = splits.train[columns], splits.train[TARGET]
    baseline = Pipeline([
        ("scale", StandardScaler()),
        ("model", LogisticRegression(max_iter=2_000, random_state=RANDOM_STATE)),
    ])
    challenger = CalibratedClassifierCV(
        estimator=HistGradientBoostingClassifier(max_iter=250, learning_rate=0.06, random_state=RANDOM_STATE),
        method="sigmoid",
        cv=3,
    )
    baseline.fit(x_train, y_train)
    challenger.fit(x_train, y_train)
    return {"logistic_baseline": baseline, "calibrated_hist_gradient_boosting": challenger}


def expected_calibration_error(y: pd.Series, probabilities: np.ndarray, bins: int = 10) -> float:
    bucket = np.minimum((probabilities * bins).astype(int), bins - 1)
    return float(sum(
        abs(y.iloc[bucket == index].mean() - probabilities[bucket == index].mean()) * (bucket == index).mean()
        for index in range(bins) if (bucket == index).any()
    ))


def metric_summary(y: pd.Series, probabilities: np.ndarray) -> dict[str, float]:
    return {
        "auroc": round(float(roc_auc_score(y, probabilities)), 4),
        "pr_auc": round(float(average_precision_score(y, probabilities)), 4),
        "brier": round(float(brier_score_loss(y, probabilities)), 4),
        "ece_10_bin": round(expected_calibration_error(y.reset_index(drop=True), probabilities), 4),
    }


def confidence_intervals(y: pd.Series, probabilities: np.ndarray, iterations: int = 300) -> dict[str, list[float]]:
    rng = np.random.default_rng(RANDOM_STATE)
    y_array = y.to_numpy()
    values: dict[str, list[float]] = {"auroc": [], "pr_auc": [], "brier": []}
    for _ in range(iterations):
        index = rng.integers(0, len(y_array), len(y_array))
        if len(np.unique(y_array[index])) < 2:
            continue
        values["auroc"].append(roc_auc_score(y_array[index], probabilities[index]))
        values["pr_auc"].append(average_precision_score(y_array[index], probabilities[index]))
        values["brier"].append(brier_score_loss(y_array[index], probabilities[index]))
    return {key: [round(float(np.quantile(value, 0.025)), 4), round(float(np.quantile(value, 0.975)), 4)] for key, value in values.items()}


def threshold_table(y: pd.Series, probabilities: np.ndarray, thresholds: tuple[float, ...] = (0.10, 0.20, 0.30, 0.40)) -> list[dict[str, float]]:
    records = []
    for threshold in thresholds:
        selected = probabilities >= threshold
        tp = int(((selected) & (y.to_numpy() == 1)).sum())
        fp = int(((selected) & (y.to_numpy() == 0)).sum())
        fn = int(((~selected) & (y.to_numpy() == 1)).sum())
        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        records.append({"threshold": threshold, "review_rate": round(float(selected.mean()), 4), "precision": round(precision, 4), "recall": round(recall, 4)})
    return records


def fairness_diagnostics(test: pd.DataFrame, probabilities: np.ndarray) -> dict[str, Any]:
    """Aggregate diagnostics only; groups never enter the model or review queue."""
    audit = test[["SEX", "AGE", TARGET]].copy()
    audit["age_band"] = pd.cut(audit["AGE"], bins=[20, 29, 39, 49, 59, 100], right=True)
    audit["score"] = probabilities
    result: dict[str, Any] = {}
    for grouping in ("SEX", "age_band"):
        rows = []
        for label, group in audit.groupby(grouping, observed=True):
            if len(group) < 100 or group[TARGET].nunique() < 2:
                continue
            rows.append({"group": str(label), "n": int(len(group)), "default_rate": round(float(group[TARGET].mean()), 4), "auroc": round(float(roc_auc_score(group[TARGET], group["score"])), 4), "mean_score": round(float(group["score"].mean()), 4)})
        result[grouping] = rows
    return result


def write_reports(results: dict[str, Any], report_dir: Path) -> None:
    report_dir.mkdir(parents=True, exist_ok=True)
    (report_dir / "evaluation.json").write_text(json.dumps(results, indent=2) + "\n")
    chosen = results["models"]["calibrated_hist_gradient_boosting"]
    markdown = f"""# Retrospective evaluation

## Scope

This is a local-only academic benchmark evaluation. It supports aggregate portfolio monitoring and does not approve, deny, price, or recommend consumer credit.

## Holdout metrics

| Metric | Calibrated challenger |
| --- | ---: |
| AUROC | {chosen['metrics']['auroc']:.4f} |
| PR-AUC | {chosen['metrics']['pr_auc']:.4f} |
| Brier score | {chosen['metrics']['brier']:.4f} |
| 10-bin ECE | {chosen['metrics']['ece_10_bin']:.4f} |

The full deterministic metrics, bootstrap confidence intervals, review-threshold trade-offs, and aggregate diagnostic groups are in `evaluation.json`.
"""
    (report_dir / "evaluation.md").write_text(markdown)
    card = """# Model card — local retrospective benchmark

## Intended use

Aggregate, retrospective monitoring of the UCI academic benchmark only. It is not for live underwriting, approval, denial, pricing, or individual recommendations.

## Feature and fairness policy

The models use 19 financial and repayment-history fields. ID, sex, education, marriage, and age are excluded from training, thresholds, and review output. Sex and age are used only for aggregate holdout diagnostics.

## Key limitations

All records share one observed target horizon, so a true out-of-time evaluation is not possible. The fixed stratified split measures retrospective generalization only. Results must not be represented as operational lending performance or BNPL performance.
"""
    (report_dir / "model-card.md").write_text(card)


def run(source: Path, output_dir: Path, derived_dir: Path) -> dict[str, Any]:
    frame = load_and_validate(source)
    columns = feature_columns(frame)
    splits = split_frame(frame)
    derived_dir.mkdir(parents=True, exist_ok=True)
    analysis = frame.drop(columns=list(PROTECTED_COLUMNS)).copy()
    analysis.to_parquet(derived_dir / "analytical_table.parquet", index=False)
    metadata = pq.read_metadata(derived_dir / "analytical_table.parquet")
    if metadata.num_rows != len(analysis):
        raise ValueError("Derived analytical table row count does not match source.")
    models = fit_models(splits, columns)
    model_results: dict[str, Any] = {}
    for name, model in models.items():
        probabilities = model.predict_proba(splits.test[columns])[:, 1]
        model_results[name] = {
            "metrics": metric_summary(splits.test[TARGET], probabilities),
            "confidence_intervals_95": confidence_intervals(splits.test[TARGET], probabilities),
            "threshold_tradeoffs": threshold_table(splits.test[TARGET], probabilities),
        }
        if name == "calibrated_hist_gradient_boosting":
            model_results[name]["aggregate_fairness_diagnostics"] = fairness_diagnostics(splits.test, probabilities)
    results = {
        "scope": "local-only retrospective academic benchmark; not a lending decision system",
        "split": {"method": "fixed stratified 60/20/20", "random_state": RANDOM_STATE, "limitation": "No true out-of-time split is possible because the source has one target horizon."},
        "feature_policy": {"included_count": len(columns), "excluded": [ID_COLUMN, *PROTECTED_COLUMNS, TARGET]},
        "models": model_results,
    }
    write_reports(results, output_dir)
    return results
