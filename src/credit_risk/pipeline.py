"""Reproducible retrospective evaluation for the UCI benchmark."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import pyarrow.parquet as pq
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import ExtraTreesClassifier, HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, brier_score_loss, roc_auc_score
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

TARGET = "default payment next month"
ID_COLUMN = "ID"
PROTECTED_COLUMNS = ("SEX", "EDUCATION", "MARRIAGE", "AGE")
EXPECTED_COLUMNS = ("ID", "LIMIT_BAL", "SEX", "EDUCATION", "MARRIAGE", "AGE", "PAY_0", "PAY_2", "PAY_3", "PAY_4", "PAY_5", "PAY_6", "BILL_AMT1", "BILL_AMT2", "BILL_AMT3", "BILL_AMT4", "BILL_AMT5", "BILL_AMT6", "PAY_AMT1", "PAY_AMT2", "PAY_AMT3", "PAY_AMT4", "PAY_AMT5", "PAY_AMT6", TARGET)
RANDOM_STATE = 20260801


@dataclass(frozen=True)
class SplitData:
    train: pd.DataFrame
    validation: pd.DataFrame
    test: pd.DataFrame


def load_and_validate(source: Path) -> pd.DataFrame:
    frame = pd.read_excel(source, header=1)
    if tuple(frame.columns) != EXPECTED_COLUMNS or len(frame) != 30_000 or frame[ID_COLUMN].duplicated().any():
        raise ValueError("Unexpected source schema, row count, or duplicate IDs.")
    if frame.isna().any().any() or set(frame[TARGET].unique()) != {0, 1}:
        raise ValueError("Missing values or invalid target values.")
    if not frame["LIMIT_BAL"].between(10_000, 1_000_000).all() or not frame["AGE"].between(21, 79).all():
        raise ValueError("Observed source range changed.")
    repayment = frame[[f"PAY_{period}" for period in (0, 2, 3, 4, 5, 6)]]
    if not repayment.apply(lambda column: column.between(-2, 8).all()).all():
        raise ValueError("Observed repayment-status range changed.")
    return frame


def split_frame(frame: pd.DataFrame) -> SplitData:
    train, temporary = train_test_split(frame, test_size=.40, stratify=frame[TARGET], random_state=RANDOM_STATE)
    validation, test = train_test_split(temporary, test_size=.50, stratify=temporary[TARGET], random_state=RANDOM_STATE)
    return SplitData(train.copy(), validation.copy(), test.copy())


def feature_columns(frame: pd.DataFrame) -> list[str]:
    columns = [column for column in frame.columns if column not in {ID_COLUMN, TARGET, *PROTECTED_COLUMNS}]
    if len(columns) != 19:
        raise ValueError("Feature policy violation.")
    return columns


def model_factories() -> dict[str, Any]:
    return {
        "logistic_baseline": lambda: Pipeline([("scale", StandardScaler()), ("model", LogisticRegression(C=.5, max_iter=2_000, random_state=RANDOM_STATE))]),
        "calibrated_hist_gradient_boosting": lambda: CalibratedClassifierCV(HistGradientBoostingClassifier(max_iter=350, learning_rate=.045, max_leaf_nodes=15, l2_regularization=.5, random_state=RANDOM_STATE), method="sigmoid", cv=3),
        "calibrated_extra_trees": lambda: CalibratedClassifierCV(ExtraTreesClassifier(n_estimators=300, min_samples_leaf=8, max_features=.8, n_jobs=-1, random_state=RANDOM_STATE), method="sigmoid", cv=3),
    }


def expected_calibration_error(y: pd.Series, probabilities: np.ndarray, bins: int = 10) -> float:
    bucket = np.minimum((probabilities * bins).astype(int), bins - 1)
    return float(sum(abs(y.iloc[bucket == index].mean() - probabilities[bucket == index].mean()) * (bucket == index).mean() for index in range(bins) if (bucket == index).any()))


def metric_summary(y: pd.Series, probabilities: np.ndarray) -> dict[str, float]:
    return {"auroc": round(float(roc_auc_score(y, probabilities)), 4), "pr_auc": round(float(average_precision_score(y, probabilities)), 4), "brier": round(float(brier_score_loss(y, probabilities)), 4), "ece_10_bin": round(expected_calibration_error(y.reset_index(drop=True), probabilities), 4)}


def confidence_intervals(y: pd.Series, probabilities: np.ndarray, iterations: int = 300) -> dict[str, list[float]]:
    rng, y_array = np.random.default_rng(RANDOM_STATE), y.to_numpy()
    values: dict[str, list[float]] = {"auroc": [], "pr_auc": [], "brier": []}
    for _ in range(iterations):
        index = rng.integers(0, len(y_array), len(y_array))
        if len(np.unique(y_array[index])) > 1:
            values["auroc"].append(roc_auc_score(y_array[index], probabilities[index])); values["pr_auc"].append(average_precision_score(y_array[index], probabilities[index])); values["brier"].append(brier_score_loss(y_array[index], probabilities[index]))
    return {key: [round(float(np.quantile(value, .025)), 4), round(float(np.quantile(value, .975)), 4)] for key, value in values.items()}


def capacity_table(y: pd.Series, probabilities: np.ndarray, capacities: tuple[float, ...] = (.05, .10, .20, .35, .50)) -> list[dict[str, float]]:
    order, total = np.argsort(-probabilities), int(y.sum())
    result = []
    for capacity in capacities:
        take = max(1, round(len(y) * capacity)); selected = y.to_numpy()[order[:take]]
        hits = int(selected.sum())
        result.append({"capacity": capacity, "review_rate": round(take / len(y), 4), "precision": round(hits / take, 4), "recall": round(hits / total, 4), "captured_defaults": hits})
    return result


def lift_table(y: pd.Series, probabilities: np.ndarray) -> list[dict[str, float]]:
    order, baseline = np.argsort(-probabilities), float(y.mean())
    rows = []
    for index, values in enumerate(np.array_split(y.to_numpy()[order], 10), 1):
        rate = float(values.mean()); rows.append({"decile": index, "n": int(len(values)), "default_rate": round(rate, 4), "lift": round(rate / baseline, 3)})
    return rows


def calibration_table(y: pd.Series, probabilities: np.ndarray) -> list[dict[str, float]]:
    rows = []
    for index in range(10):
        lower, upper = index / 10, (index + 1) / 10
        mask = (probabilities >= lower) & (probabilities < upper if index < 9 else probabilities <= upper)
        if mask.any(): rows.append({"bin": f"{lower:.1f}-{upper:.1f}", "n": int(mask.sum()), "mean_score": round(float(probabilities[mask].mean()), 4), "observed_rate": round(float(y.to_numpy()[mask].mean()), 4)})
    return rows


def fairness_diagnostics(test: pd.DataFrame, probabilities: np.ndarray) -> dict[str, Any]:
    audit = test[["SEX", "AGE", TARGET]].copy(); audit["age_band"] = pd.cut(audit["AGE"], bins=[20, 29, 39, 49, 59, 100]); audit["score"] = probabilities
    result: dict[str, Any] = {}
    for grouping in ("SEX", "age_band"):
        result[grouping] = [{"group": str(label), "n": int(len(group)), "default_rate": round(float(group[TARGET].mean()), 4), "auroc": round(float(roc_auc_score(group[TARGET], group.score)), 4), "mean_score": round(float(group.score.mean()), 4)} for label, group in audit.groupby(grouping, observed=True) if len(group) >= 100 and group[TARGET].nunique() == 2]
    return result


def out_of_fold_scores(frame: pd.DataFrame, columns: list[str], model_name: str) -> np.ndarray:
    scores = np.zeros(len(frame)); factory = model_factories()[model_name]
    for train, test in StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE).split(frame[columns], frame[TARGET]):
        model = factory(); model.fit(frame.iloc[train][columns], frame.iloc[train][TARGET]); scores[test] = model.predict_proba(frame.iloc[test][columns])[:, 1]
    return scores


def run(source: Path, output_dir: Path, derived_dir: Path) -> dict[str, Any]:
    frame, columns, splits = load_and_validate(source), [], None
    columns, splits = feature_columns(frame), split_frame(frame)
    derived_dir.mkdir(parents=True, exist_ok=True); analysis = frame.drop(columns=list(PROTECTED_COLUMNS)); analysis.to_parquet(derived_dir / "analytical_table.parquet", index=False)
    if pq.read_metadata(derived_dir / "analytical_table.parquet").num_rows != len(frame): raise ValueError("Derived row count mismatch.")
    validation_scores: dict[str, np.ndarray] = {}; fitted: dict[str, Any] = {}
    for name, factory in model_factories().items():
        fitted[name] = factory(); fitted[name].fit(splits.train[columns], splits.train[TARGET]); validation_scores[name] = fitted[name].predict_proba(splits.validation[columns])[:, 1]
    baseline = metric_summary(splits.validation[TARGET], validation_scores["logistic_baseline"])
    eligible = [name for name, scores in validation_scores.items() if name != "logistic_baseline" and metric_summary(splits.validation[TARGET], scores)["pr_auc"] > baseline["pr_auc"] and metric_summary(splits.validation[TARGET], scores)["brier"] <= baseline["brier"]]
    selected = max(eligible or ["logistic_baseline"], key=lambda name: metric_summary(splits.validation[TARGET], validation_scores[name])["pr_auc"])
    results: dict[str, Any] = {"scope": "Validated retrospective academic credit-risk simulation; not a lending decision system.", "split": {"method": "fixed stratified 60/20/20 with validation-locked model selection", "random_state": RANDOM_STATE, "limitation": "No calendar-time or true out-of-time split is possible because the source has one target horizon."}, "feature_policy": {"included_count": len(columns), "excluded": [ID_COLUMN, *PROTECTED_COLUMNS, TARGET]}, "selection": {"selected_model": selected, "gate": "higher validation PR-AUC than logistic baseline and no worse validation Brier score", "eligible_models": eligible, "status": "promoted" if selected != "logistic_baseline" else "baseline_retained"}, "models": {}}
    for name, model in fitted.items():
        scores = model.predict_proba(splits.test[columns])[:, 1]
        item: dict[str, Any] = {"metrics": metric_summary(splits.test[TARGET], scores), "confidence_intervals_95": confidence_intervals(splits.test[TARGET], scores), "threshold_tradeoffs": capacity_table(splits.test[TARGET], scores), "lift_by_decile": lift_table(splits.test[TARGET], scores), "calibration_curve": calibration_table(splits.test[TARGET], scores)}
        if name == selected: item["aggregate_fairness_diagnostics"] = fairness_diagnostics(splits.test, scores)
        results["models"][name] = item
    output_dir.mkdir(parents=True, exist_ok=True); (output_dir / "evaluation.json").write_text(json.dumps(results, indent=2) + "\n")
    chosen = results["models"][selected]["metrics"]
    (output_dir / "evaluation.md").write_text(f"# Retrospective evaluation\n\nSelected model: **{selected}**.\n\n| Metric | Holdout |\n| --- | ---: |\n| AUROC | {chosen['auroc']:.4f} |\n| PR-AUC | {chosen['pr_auc']:.4f} |\n| Brier | {chosen['brier']:.4f} |\n| ECE | {chosen['ece_10_bin']:.4f} |\n\nThis is a validated retrospective academic simulation, not a lending decision system.\n")
    (output_dir / "model-card.md").write_text("# Model card\n\nNineteen financial and repayment fields are used. ID and demographic fields are excluded. The source has no out-of-time horizon; results are retrospective benchmark evidence only.\n")
    return results
